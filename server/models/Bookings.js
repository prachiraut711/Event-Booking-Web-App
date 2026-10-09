const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    bookingReference: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'pending'],
        default: 'pending',
        index: true
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'not_paid'],
        default: 'not_paid'
    },
    paymentMethod: {
        type: String,
        enum: ['test_checkout', 'free_rsvp', 'manual_approval', 'none'],
        default: 'manual_approval'
    },
    amount: {
        type: Number,
        required: true
    },
    bookedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);