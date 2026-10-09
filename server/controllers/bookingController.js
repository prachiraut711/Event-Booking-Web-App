const Booking = require('../models/Bookings');
const Event = require('../models/Event');
const OTP = require('../models/OTP');
const { sendBookingEmail, sendOTPEmail, formatEmailErrorMessage } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate human-readable ticket reference e.g. ES-2026-X7K9M
const generateBookingReference = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = new Date().getFullYear();
    return `ES-${year}-${code}`;
};

// POST /api/bookings/send-otp
exports.sendBookingOTP = async (req, res) => {
    try {
        const otp = generateOTP();
        await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
        await OTP.create({ email: req.user.email, otp, action: 'event_booking' });

        if (process.env.NODE_ENV === 'development') {
            console.log(`🔑 [DEV ONLY] Booking OTP for ${req.user.email}: ${otp}`);
        }

        try {
            await sendOTPEmail(req.user.email, otp, 'event_booking');
            res.json({ message: 'OTP sent to your email successfully' });
        } catch (emailErr) {
            console.error('Email delivery error on booking OTP:', emailErr.message);
            const userFriendlyMessage = formatEmailErrorMessage(emailErr);
            res.status(502).json({
                message: userFriendlyMessage,
                emailDeliveryFailed: true
            });
        }
    } catch (error) {
        console.error('Error sending booking OTP:', error);
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

// POST /api/bookings
// Supports both Instant Test/Free Booking and OTP-verified Request
exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp, quantity = 1, paymentMethod = 'test_checkout' } = req.body;
        const requestedQuantity = Math.max(1, parseInt(quantity, 10) || 1);

        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if event has passed
        if (new Date(event.date) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
            return res.status(400).json({ message: 'This event has already concluded' });
        }

        // Prevent duplicate active bookings for the same user on this event
        const activeBooking = await Booking.findOne({
            userId: req.user.id,
            eventId,
            status: { $in: ['confirmed', 'pending'] }
        });
        if (activeBooking) {
            return res.status(400).json({
                message: `You already have a ${activeBooking.status} booking for this event (Ref: ${activeBooking.bookingReference || 'Active'}). Check your dashboard.`
            });
        }

        // If OTP flow was requested, verify OTP first
        if (otp) {
            const validOTP = await OTP.findOne({ email: req.user.email, otp: otp.trim(), action: 'event_booking' });
            if (!validOTP) {
                return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
            }
            await OTP.deleteOne({ _id: validOTP._id });
        }

        // ATOMIC SEAT RESERVATION (Prevents negative seats under high concurrency)
        const updatedEvent = await Event.findOneAndUpdate(
            { _id: eventId, availableSeats: { $gte: requestedQuantity } },
            { $inc: { availableSeats: -requestedQuantity } },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(400).json({
                message: `Sorry, there are not enough seats available. (Requested: ${requestedQuantity}, Remaining: ${event.availableSeats})`
            });
        }

        const isFree = event.ticketPrice === 0;
        const totalAmount = event.ticketPrice * requestedQuantity;
        const bookingReference = generateBookingReference();

        // Determine initial status based on flow
        const isInstantConfirmed = isFree || paymentMethod === 'test_checkout' || paymentMethod === 'free_rsvp';
        const bookingStatus = isInstantConfirmed ? 'confirmed' : 'pending';
        const paymentStatus = isInstantConfirmed ? 'paid' : 'not_paid';

        const booking = await Booking.create({
            userId: req.user.id,
            eventId,
            bookingReference,
            quantity: requestedQuantity,
            status: bookingStatus,
            paymentStatus,
            paymentMethod: isFree ? 'free_rsvp' : paymentMethod,
            amount: totalAmount,
            bookedAt: new Date()
        });

        // Populate details for response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('eventId')
            .populate('userId', 'name email');

        // Send confirmation email asynchronously if confirmed
        if (bookingStatus === 'confirmed') {
            sendBookingEmail(
                req.user.email,
                req.user.name,
                event.title,
                bookingReference,
                requestedQuantity,
                totalAmount
            ).catch(err => console.warn('Email dispatch notice:', err.message));
        }

        res.status(201).json({
            message: bookingStatus === 'confirmed'
                ? 'Booking confirmed successfully!'
                : 'Booking request submitted. Awaiting confirmation.',
            booking: populatedBooking,
            availableSeats: updatedEvent.availableSeats
        });
    } catch (error) {
        console.error('Error during booking:', error);
        res.status(500).json({ message: 'Server error processing booking', error: error.message });
    }
};

// PUT /api/bookings/:id/confirm (Admin only)
exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus = 'paid' } = req.body;
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('eventId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'confirmed') {
            return res.status(400).json({ message: 'Booking is already confirmed' });
        }

        // Atomically deduct seats upon confirmation if seats were not deducted yet
        if (booking.status !== 'confirmed') {
            const eventId = booking.eventId?._id || booking.eventId;
            const requestedSeats = booking.quantity || 1;
            const updatedEvent = await Event.findOneAndUpdate(
                { _id: eventId, availableSeats: { $gte: requestedSeats } },
                { $inc: { availableSeats: -requestedSeats } },
                { new: true }
            );
            if (!updatedEvent) {
                return res.status(400).json({ message: 'No seats available to confirm this booking' });
            }
        }

        booking.status = 'confirmed';
        booking.paymentStatus = paymentStatus;
        if (!booking.bookingReference) {
            booking.bookingReference = generateBookingReference();
        }
        await booking.save();

        // Send email on admin confirmation
        sendBookingEmail(
            booking.userId.email,
            booking.userId.name,
            booking.eventId.title,
            booking.bookingReference,
            booking.quantity,
            booking.amount
        ).catch(err => console.warn('Email notification notice:', err.message));

        res.json({ message: 'Booking confirmed successfully', booking });
    } catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).json({ message: 'Server error confirming booking', error: error.message });
    }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
    try {
        const query = req.user.role === 'admin'
            ? Booking.find().populate('eventId').populate('userId', 'name email')
            : Booking.find({ userId: req.user.id }).populate('eventId');

        const bookings = await query.sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error fetching bookings', error: error.message });
    }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('eventId')
            .populate('userId', 'name email');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check authorization
        if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Error fetching single booking:', error);
        res.status(500).json({ message: 'Server error fetching booking details', error: error.message });
    }
};

// DELETE /api/bookings/:id
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'This booking is already cancelled' });
        }

        const wasConfirmed = booking.status === 'confirmed';
        const qtyToRestore = booking.quantity || 1;

        booking.status = 'cancelled';
        await booking.save();

        // Atomically restore available seats back to event if it was confirmed
        if (wasConfirmed && booking.eventId) {
            await Event.findByIdAndUpdate(
                booking.eventId,
                { $inc: { availableSeats: qtyToRestore } }
            );
        }

        res.json({ message: 'Booking cancelled successfully. Seats have been released.' });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Server error cancelling booking', error: error.message });
    }
};