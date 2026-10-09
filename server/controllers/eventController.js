const Event = require('../models/Event');
const Booking = require('../models/Bookings');

// GET /api/events
exports.getEvents = async (req, res) => {
    try {
        const filters = {};

        // Category filter (ignore 'All' or empty)
        if (req.query.category && req.query.category.toLowerCase() !== 'all') {
            filters.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
        }

        // Search in title, description, or location
        if (req.query.search && req.query.search.trim()) {
            const searchRegex = { $regex: req.query.search.trim(), $options: 'i' };
            filters.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { location: searchRegex }
            ];
        }

        // Sorting options
        let sortOption = { date: 1 }; // Default: upcoming soonest
        if (req.query.sort) {
            switch (req.query.sort) {
                case 'price-low':
                    sortOption = { ticketPrice: 1 };
                    break;
                case 'price-high':
                    sortOption = { ticketPrice: -1 };
                    break;
                case 'seats':
                    sortOption = { availableSeats: -1 };
                    break;
                case 'newest':
                    sortOption = { createdAt: -1 };
                    break;
                case 'upcoming':
                default:
                    sortOption = { date: 1 };
                    break;
            }
        }

        const events = await Event.find(filters)
            .sort(sortOption)
            .populate('createdBy', 'name email');

        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error while fetching events', error: error.message });
    }
};

// GET /api/events/:id
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        console.error('Error fetching event by ID:', error);
        res.status(500).json({ message: 'Server error while fetching event details', error: error.message });
    }
};

// POST /api/events (Admin only)
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, time, location, category, totalSeats, ticketPrice, image } = req.body;

        if (!title || !description || !date || !location || !category || totalSeats === undefined) {
            return res.status(400).json({ message: 'Please fill in all required event fields' });
        }

        const seats = Number(totalSeats);
        const price = Number(ticketPrice || 0);

        if (isNaN(seats) || seats <= 0) {
            return res.status(400).json({ message: 'Total seats must be a positive number' });
        }
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ message: 'Ticket price cannot be negative' });
        }

        const event = await Event.create({
            title: title.trim(),
            description: description.trim(),
            date: new Date(date),
            time: time || '10:00 AM',
            location: location.trim(),
            category: category.trim(),
            totalSeats: seats,
            availableSeats: seats,
            ticketPrice: price,
            image: image?.trim() || '',
            createdBy: req.user.id
        });

        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Server error while creating event', error: error.message });
    }
};

// PUT /api/events/:id (Admin only)
exports.updateEvent = async (req, res) => {
    try {
        const existingEvent = await Event.findById(req.params.id);
        if (!existingEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const { title, description, date, time, location, category, totalSeats, ticketPrice, image } = req.body;

        if (title !== undefined) existingEvent.title = title.trim();
        if (description !== undefined) existingEvent.description = description.trim();
        if (date !== undefined) existingEvent.date = new Date(date);
        if (time !== undefined) existingEvent.time = time.trim();
        if (location !== undefined) existingEvent.location = location.trim();
        if (category !== undefined) existingEvent.category = category.trim();
        if (image !== undefined) existingEvent.image = image.trim();

        if (ticketPrice !== undefined) {
            const price = Number(ticketPrice);
            if (isNaN(price) || price < 0) {
                return res.status(400).json({ message: 'Ticket price must be a non-negative number' });
            }
            existingEvent.ticketPrice = price;
        }

        if (totalSeats !== undefined) {
            const newTotal = Number(totalSeats);
            if (isNaN(newTotal) || newTotal <= 0) {
                return res.status(400).json({ message: 'Total seats must be a positive number' });
            }
            // Preserve booked seats count correctly
            const bookedSeats = existingEvent.totalSeats - existingEvent.availableSeats;
            if (newTotal < bookedSeats) {
                return res.status(400).json({
                    message: `Cannot decrease total seats below already booked seats (${bookedSeats})`
                });
            }
            existingEvent.totalSeats = newTotal;
            existingEvent.availableSeats = newTotal - bookedSeats;
        }

        const updatedEvent = await existingEvent.save();
        res.json(updatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Server error while updating event', error: error.message });
    }
};

// DELETE /api/events/:id (Admin only)
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Also clean up or mark bookings for this deleted event
        await Booking.updateMany(
            { eventId: req.params.id, status: { $ne: 'cancelled' } },
            { $set: { status: 'cancelled' } }
        );

        res.json({ message: 'Event and associated bookings updated successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Server error while deleting event', error: error.message });
    }
};