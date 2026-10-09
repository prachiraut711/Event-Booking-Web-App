import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import TicketModal from '../components/TicketModal';
import ConfirmModal from '../components/ConfirmModal';
import {
    FaTicketAlt,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaQrcode,
    FaTimesCircle,
    FaCheckCircle,
    FaHourglassHalf,
    FaBan,
    FaArrowRight
} from 'react-icons/fa';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const toast = useToast();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('all');

    // Modals
    const [activeTicket, setActiveTicket] = useState(null);
    const [bookingToCancel, setBookingToCancel] = useState(null);

    const fetchBookings = useCallback(async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load your bookings');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user, fetchBookings]);

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return;
        try {
            const { data } = await api.delete(`/bookings/${bookingToCancel._id}`);
            toast.success(data.message || 'Booking cancelled');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error cancelling booking');
        } finally {
            setBookingToCancel(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium text-sm">Loading your ticket dashboard...</p>
            </div>
        );
    }

    const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
    const pendingCount = bookings.filter((b) => b.status === 'pending').length;
    const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;

    const filteredBookings = bookings.filter((b) => {
        if (selectedTab === 'confirmed') return b.status === 'confirmed';
        if (selectedTab === 'pending') return b.status === 'pending';
        if (selectedTab === 'cancelled') return b.status === 'cancelled';
        return true;
    });

    return (
        <div className="max-w-6xl mx-auto py-4">
            {/* User Profile Header Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5">
                    <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-slate-800 text-orange-400 border border-slate-700 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Attendee
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name}</h1>
                        <p className="text-slate-400 text-xs sm:text-sm">{user?.email}</p>
                    </div>
                </div>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full md:w-auto">
                    <div className="bg-slate-800/80 p-3.5 sm:p-4 rounded-2xl text-center border border-slate-700">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bookings</p>
                        <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{bookings.length}</p>
                    </div>
                    <div className="bg-slate-800/80 p-3.5 sm:p-4 rounded-2xl text-center border border-slate-700">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confirmed</p>
                        <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{confirmedCount}</p>
                    </div>
                    <div className="bg-slate-800/80 p-3.5 sm:p-4 rounded-2xl text-center border border-slate-700">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending</p>
                        <p className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{pendingCount}</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        onClick={() => setSelectedTab('all')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                            selectedTab === 'all'
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        All ({bookings.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('confirmed')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                            selectedTab === 'confirmed'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        <FaCheckCircle className="text-xs" /> Confirmed ({confirmedCount})
                    </button>
                    <button
                        onClick={() => setSelectedTab('pending')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                            selectedTab === 'pending'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        <FaHourglassHalf className="text-xs" /> Pending ({pendingCount})
                    </button>
                    <button
                        onClick={() => setSelectedTab('cancelled')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                            selectedTab === 'cancelled'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        <FaBan className="text-xs" /> Cancelled ({cancelledCount})
                    </button>
                </div>

                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition"
                >
                    <span>Browse More Events</span> <FaArrowRight className="text-[10px]" />
                </Link>
            </div>

            {/* Bookings List / Grid */}
            {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto my-8">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-4">
                        <FaTicketAlt />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No Tickets Found</h3>
                    <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
                        {selectedTab === 'all'
                            ? "You haven't reserved any event tickets yet."
                            : `You have no ${selectedTab} bookings.`}
                    </p>
                    <Link
                        to="/"
                        className="inline-block bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm transition shadow-md"
                    >
                        Explore Upcoming Events
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBookings.map((booking) => {
                        const event = booking.eventId;
                        const isConfirmed = booking.status === 'confirmed';
                        const isPending = booking.status === 'pending';
                        const isCancelled = booking.status === 'cancelled';
                        const bookingRef = booking.bookingReference || `ES-${booking._id?.substring(0, 8).toUpperCase()}`;

                        return (
                            <div
                                key={booking._id}
                                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                            >
                                <div className="p-6">
                                    {/* Card Header: Category & Badges */}
                                    <div className="flex justify-between items-start gap-2 mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                            {event?.category || 'Event'}
                                        </span>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                                                isConfirmed
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : isPending
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-rose-100 text-rose-800'
                                            }`}>
                                                {booking.status}
                                            </span>
                                            {!isCancelled && (
                                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                                                    booking.paymentStatus === 'paid'
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {booking.paymentStatus?.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Event Title */}
                                    <h3 className="text-base font-bold text-slate-900 leading-snug mb-3 line-clamp-2">
                                        {event ? event.title : 'Event details unavailable'}
                                    </h3>

                                    {/* Metadata */}
                                    {event ? (
                                        <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-orange-500 text-xs shrink-0" />
                                                <span className="font-medium text-slate-800">
                                                    {new Date(event.date).toLocaleDateString(undefined, {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 truncate">
                                                <FaMapMarkerAlt className="text-rose-500 text-xs shrink-0" />
                                                <span className="truncate text-slate-600">{event.location}</span>
                                            </div>
                                            <div className="pt-2 border-t border-slate-200/60 flex justify-between text-[11px]">
                                                <span>Ref: <strong className="font-mono text-slate-800">{bookingRef}</strong></span>
                                                <span>{booking.quantity || 1} Seat{(booking.quantity || 1) > 1 ? 's' : ''} • {booking.amount === 0 ? 'FREE' : `₹${booking.amount}`}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-rose-500 italic mb-4">Event may have been removed.</p>
                                    )}
                                </div>

                                {/* Actions Footer */}
                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                                    {isConfirmed ? (
                                        <div className="w-full flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTicket(booking)}
                                                className="flex-grow flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-3 rounded-xl text-xs transition shadow-sm"
                                            >
                                                <FaQrcode /> View Digital E-Ticket
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBookingToCancel(booking)}
                                                className="px-3 py-2.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                                                title="Cancel Reservation"
                                            >
                                                <FaTimesCircle /> Cancel
                                            </button>
                                        </div>
                                    ) : isPending ? (
                                        <div className="w-full flex items-center justify-between gap-2">
                                            <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                                                <FaHourglassHalf className="text-[10px]" /> Awaiting Confirmation
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setBookingToCancel(booking)}
                                                className="text-rose-600 hover:text-rose-800 text-xs font-bold transition flex items-center gap-1"
                                            >
                                                <FaTimesCircle /> Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full text-center text-xs text-slate-400 font-medium py-1">
                                            Booking Cancelled
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Digital E-Ticket Modal */}
            <TicketModal
                isOpen={Boolean(activeTicket)}
                booking={activeTicket}
                onClose={() => setActiveTicket(null)}
                onCancel={(b) => setBookingToCancel(b)}
            />

            {/* Cancel Booking Confirmation Modal */}
            <ConfirmModal
                isOpen={Boolean(bookingToCancel)}
                title={bookingToCancel?.status === 'confirmed' ? "Cancel Confirmed Reservation?" : "Cancel Booking Request?"}
                message={bookingToCancel?.status === 'confirmed'
                    ? `Are you sure you want to cancel your confirmed ticket (Ref: ${bookingToCancel.bookingReference || 'Active'}) for "${bookingToCancel.eventId?.title || 'this event'}"? Your ${bookingToCancel.quantity || 1} reserved seat(s) will be released back to the event inventory.`
                    : `Are you sure you want to cancel your booking request for "${bookingToCancel?.eventId?.title || 'this event'}"?`
                }
                confirmText="Yes, Cancel Booking"
                cancelText="Keep My Booking"
                isDanger={true}
                onConfirm={handleConfirmCancel}
                onClose={() => setBookingToCancel(null)}
            />
        </div>
    );
};

export default UserDashboard;