import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TestCheckoutModal from '../components/TestCheckoutModal';
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaChair,
    FaMoneyBillWave,
    FaClock,
    FaUser,
    FaArrowLeft,
    FaShieldAlt,
    FaCheck,
    FaPlus,
    FaMinus
} from 'react-icons/fa';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const toast = useToast();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const isSoldOut = event?.availableSeats <= 0;
    const isFree = event?.ticketPrice === 0;
    const maxAllowedTickets = event ? Math.min(5, Math.max(1, event.availableSeats)) : 1;

    const handleQuantityChange = (delta) => {
        setQuantity((prev) => {
            const next = prev + delta;
            if (next < 1) return 1;
            if (next > maxAllowedTickets) return maxAllowedTickets;
            return next;
        });
    };

    const handleBookingClick = () => {
        if (!user) {
            navigate('/login', { state: { from: `/events/${id}` } });
            return;
        }

        if (isFree) {
            // Instant free booking
            executeBooking('free_rsvp');
        } else {
            // Open simulated test checkout modal
            setShowCheckoutModal(true);
        }
    };

    const executeBooking = async (paymentMethod = 'test_checkout') => {
        setBookingLoading(true);
        setError('');

        try {
            const { data } = await api.post('/bookings', {
                eventId: event._id,
                quantity,
                paymentMethod
            });

            // Update real-time local seats from backend response
            if (data.availableSeats !== undefined) {
                setEvent((prev) => ({ ...prev, availableSeats: data.availableSeats }));
            }

            toast.success(data.message || 'Booking confirmed!');
            setShowCheckoutModal(false);

            // Navigate to payment-success with complete booking context
            navigate('/payment-success', {
                state: {
                    booking: data.booking,
                    eventTitle: event.title,
                    bookingReference: data.booking?.bookingReference,
                    quantity,
                    amount: event.ticketPrice * quantity
                }
            });
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Failed to complete booking. Please try again.';
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium text-sm">Loading event details...</p>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-rose-100 text-center shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Event Unavailable</h3>
                <p className="text-slate-500 text-sm mb-6">{error}</p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-black transition"
                >
                    <FaArrowLeft className="text-xs" /> Return to Events
                </Link>
            </div>
        );
    }

    const totalAmount = (event.ticketPrice || 0) * quantity;
    const formattedDate = new Date(event.date).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="max-w-5xl mx-auto py-4">
            {/* Back Navigation Bar */}
            <div className="mb-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-semibold transition"
                >
                    <FaArrowLeft className="text-xs" /> Back to All Events
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/80">
                {/* Hero Cover Image */}
                <div className="relative h-64 sm:h-96 w-full bg-slate-900 overflow-hidden">
                    {event.image ? (
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div
                        className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white/40 text-4xl sm:text-6xl font-black uppercase tracking-widest"
                        style={{ display: event.image ? 'none' : 'flex' }}
                    >
                        {event.category}
                    </div>

                    <div className="absolute top-4 left-4">
                        <span className="bg-slate-950/80 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black text-orange-400 uppercase tracking-widest border border-white/10 shadow-lg">
                            {event.category}
                        </span>
                    </div>

                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-black shadow-lg">
                        {isFree ? (
                            <span className="text-emerald-600 tracking-wide font-extrabold">FREE ADMISSION</span>
                        ) : (
                            <span className="text-slate-900">₹{event.ticketPrice} / ticket</span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-10 lg:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Left 2 Cols: Event Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                                    {event.title}
                                </h1>

                                {event.createdBy?.name && (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                            <FaUser />
                                        </div>
                                        <span>Organized by <strong className="text-slate-800">{event.createdBy.name}</strong></span>
                                    </div>
                                )}

                                <div className="prose prose-slate max-w-none text-slate-600 text-base leading-relaxed whitespace-pre-line border-t border-slate-100 pt-6">
                                    {event.description}
                                </div>
                            </div>

                            {/* Event Logistics Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                        <FaCalendarAlt />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Event Date</p>
                                        <p className="font-bold text-slate-800 text-sm mt-0.5">{formattedDate}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                        <FaClock />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Time Slot</p>
                                        <p className="font-bold text-slate-800 text-sm mt-0.5">{event.time || '10:00 AM'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Location & Venue</p>
                                        <p className="font-bold text-slate-800 text-sm mt-0.5">{event.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Booking Widget Box */}
                        <div className="lg:col-span-1">
                            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm sticky top-28 space-y-6">
                                <div className="border-b border-slate-200 pb-4">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Reservation
                                    </span>
                                    <div className="flex justify-between items-baseline mt-1">
                                        <span className="text-2xl font-black text-slate-900">
                                            {isFree ? 'Free Admission' : `₹${event.ticketPrice}`}
                                        </span>
                                        {!isFree && <span className="text-xs text-slate-500 font-medium">per attendee</span>}
                                    </div>
                                </div>

                                {/* Seat Availability Status */}
                                <div>
                                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                                        <span className="text-slate-600 flex items-center gap-1.5">
                                            <FaChair className="text-slate-400" /> Availability
                                        </span>
                                        <span className={isSoldOut ? 'text-rose-600 font-bold' : event.availableSeats < 15 ? 'text-amber-600 font-bold' : 'text-slate-800 font-bold'}>
                                            {isSoldOut ? 'Sold Out' : `${event.availableSeats} of ${event.totalSeats} seats`}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${
                                                isSoldOut ? 'bg-rose-500' : event.availableSeats < 15 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${Math.min(100, (event.availableSeats / event.totalSeats) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                {!isSoldOut && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                            Select Tickets (Max {maxAllowedTickets})
                                        </label>
                                        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
                                            <button
                                                type="button"
                                                onClick={() => handleQuantityChange(-1)}
                                                disabled={quantity <= 1}
                                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition disabled:opacity-40"
                                                aria-label="Decrease tickets"
                                            >
                                                <FaMinus className="text-xs" />
                                            </button>
                                            <span className="text-base font-black text-slate-900 font-mono">
                                                {quantity} Ticket{quantity > 1 ? 's' : ''}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleQuantityChange(1)}
                                                disabled={quantity >= maxAllowedTickets}
                                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition disabled:opacity-40"
                                                aria-label="Increase tickets"
                                            >
                                                <FaPlus className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Subtotal calculation */}
                                {!isSoldOut && (
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                                        <div className="flex justify-between text-slate-500">
                                            <span>Subtotal ({quantity}x)</span>
                                            <span>{isFree ? 'FREE' : `₹${totalAmount}`}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Service Fee</span>
                                            <span className="text-emerald-600 font-bold">₹0</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                                            <span>Total Amount</span>
                                            <span className="text-orange-600 text-base">
                                                {isFree ? 'FREE' : `₹${totalAmount}`}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                                        {error}
                                    </div>
                                )}

                                {/* Main Booking CTA */}
                                <button
                                    onClick={handleBookingClick}
                                    disabled={isSoldOut || bookingLoading}
                                    className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base transition shadow-md flex items-center justify-center gap-2 ${
                                        isSoldOut
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20 hover:-translate-y-0.5'
                                    }`}
                                >
                                    {bookingLoading ? (
                                        <span>Processing Reservation...</span>
                                    ) : isSoldOut ? (
                                        <span>Sold Out</span>
                                    ) : !user ? (
                                        <span>Sign in to Book</span>
                                    ) : isFree ? (
                                        <span>Confirm Free RSVP</span>
                                    ) : (
                                        <span>Proceed to Checkout (₹{totalAmount})</span>
                                    )}
                                </button>

                                <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 font-medium">
                                    <FaShieldAlt className="text-emerald-500" />
                                    <span>Instant digital QR E-Ticket pass generated</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulated Checkout Modal for Paid Events */}
            <TestCheckoutModal
                isOpen={showCheckoutModal}
                event={event}
                quantity={quantity}
                user={user}
                loading={bookingLoading}
                onConfirm={() => executeBooking('test_checkout')}
                onClose={() => setShowCheckoutModal(false)}
            />
        </div>
    );
};

export default EventDetail;