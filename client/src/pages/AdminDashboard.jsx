import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/axios';
import EventFormModal from '../components/EventFormModal';
import ConfirmModal from '../components/ConfirmModal';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaCheck,
    FaTimes,
    FaSearch,
    FaFilter,
    FaRupeeSign,
    FaTicketAlt,
    FaCalendarAlt,
    FaUsers
} from 'react-icons/fa';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const toast = useToast();

    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and search
    const [activeSection, setActiveSection] = useState('events'); // 'events' | 'bookings'
    const [bookingFilter, setBookingFilter] = useState('all');
    const [eventSearch, setEventSearch] = useState('');
    const [bookingSearch, setBookingSearch] = useState('');

    // Modals
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [eventsRes, bookingsRes] = await Promise.all([
                api.get('/events?sort=newest'),
                api.get('/bookings/my')
            ]);
            setEvents(eventsRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Failed to load administrative data');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchData();
        }
    }, [user, fetchData]);

    // Handle Create & Edit Event
    const handleSaveEvent = async (formData, editId) => {
        setModalLoading(true);
        try {
            if (editId) {
                await api.put(`/events/${editId}`, formData);
                toast.success('Event updated successfully');
            } else {
                await api.post('/events', formData);
                toast.success('New event published successfully');
            }
            setIsEventModalOpen(false);
            setEventToEdit(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving event');
        } finally {
            setModalLoading(false);
        }
    };

    // Handle Delete Event
    const handleConfirmDeleteEvent = async () => {
        if (!eventToDelete) return;
        try {
            await api.delete(`/events/${eventToDelete._id}`);
            toast.success('Event deleted successfully');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting event');
        } finally {
            setEventToDelete(null);
        }
    };

    // Handle Booking Approval
    const handleConfirmBooking = async (id, paymentStatus) => {
        try {
            const { data } = await api.put(`/bookings/${id}/confirm`, { paymentStatus });
            toast.success(data.message || 'Booking approved');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error approving booking');
        }
    };

    // Handle Booking Cancellation / Rejection
    const handleConfirmRejectBooking = async () => {
        if (!bookingToCancel) return;
        try {
            await api.delete(`/bookings/${bookingToCancel._id}`);
            toast.success('Booking request rejected and cancelled');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error rejecting booking');
        } finally {
            setBookingToCancel(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium text-sm">Loading admin dashboard...</p>
            </div>
        );
    }

    // Financial & Operational Metrics
    const totalRevenue = bookings.reduce((sum, b) => {
        return (b.status === 'confirmed' && b.paymentStatus === 'paid') ? sum + (b.amount || 0) : sum;
    }, 0);

    const confirmedTicketsCount = bookings
        .filter((b) => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.quantity || 1), 0);

    const pendingRequestsCount = bookings.filter((b) => b.status === 'pending').length;

    // Filtered lists
    const filteredEvents = events.filter((e) => {
        if (!eventSearch.trim()) return true;
        const q = eventSearch.toLowerCase();
        return e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    });

    const filteredBookings = bookings.filter((b) => {
        const matchesStatus = bookingFilter === 'all' || b.status === bookingFilter;
        if (!matchesStatus) return false;
        if (!bookingSearch.trim()) return true;
        const q = bookingSearch.toLowerCase();
        const userName = b.userId?.name?.toLowerCase() || '';
        const userEmail = b.userId?.email?.toLowerCase() || '';
        const eventTitle = b.eventId?.title?.toLowerCase() || '';
        const ref = b.bookingReference?.toLowerCase() || '';
        return userName.includes(q) || userEmail.includes(q) || eventTitle.includes(q) || ref.includes(q);
    });

    return (
        <div className="max-w-7xl mx-auto py-4">
            {/* Admin Header Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-indigo-950/80 px-3 py-1 rounded-full text-[11px] font-bold text-orange-400 uppercase tracking-widest border border-indigo-800 mb-2">
                        <span>⚡</span> Administrative Management
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight">EventSphere Operations</h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage events, approve reservations, and monitor revenue analytics.</p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setEventToEdit(null);
                        setIsEventModalOpen(true);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-orange-950 transition hover:-translate-y-0.5 text-sm"
                >
                    <FaPlus /> Create New Event
                </button>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gross Revenue</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">₹{totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                        <FaRupeeSign />
                    </div>
                </div>

                {/* Confirmed Tickets */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Confirmed Seats</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{confirmedTicketsCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl shrink-0">
                        <FaTicketAlt />
                    </div>
                </div>

                {/* Pending Requests */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Approvals</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{pendingRequestsCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shrink-0">
                        <FaFilter />
                    </div>
                </div>

                {/* Total Events */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Events</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{events.length}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl shrink-0">
                        <FaCalendarAlt />
                    </div>
                </div>
            </div>

            {/* Section Switcher Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
                <button
                    onClick={() => setActiveSection('events')}
                    className={`py-3 px-6 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                        activeSection === 'events'
                            ? 'border-orange-600 text-orange-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <FaCalendarAlt /> All Events ({events.length})
                </button>
                <button
                    onClick={() => setActiveSection('bookings')}
                    className={`py-3 px-6 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                        activeSection === 'bookings'
                            ? 'border-orange-600 text-orange-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <FaUsers /> Attendee Bookings ({bookings.length})
                    {pendingRequestsCount > 0 && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {pendingRequestsCount} new
                        </span>
                    )}
                </button>
            </div>

            {/* SECTION 1: EVENTS MANAGEMENT */}
            {activeSection === 'events' && (
                <div>
                    {/* Events Search Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
                        <div className="relative flex-grow max-w-md">
                            <FaSearch className="absolute left-4 top-3.5 text-slate-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Search events by title or category..."
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                                value={eventSearch}
                                onChange={(e) => setEventSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredEvents.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                            <p className="text-slate-500 font-medium">No events found matching your search.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
                                        <tr>
                                            <th className="py-3.5 px-6">Event</th>
                                            <th className="py-3.5 px-4">Category</th>
                                            <th className="py-3.5 px-4">Date & Time</th>
                                            <th className="py-3.5 px-4">Price</th>
                                            <th className="py-3.5 px-4">Seat Availability</th>
                                            <th className="py-3.5 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredEvents.map((event) => (
                                            <tr key={event._id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                            {event.image ? (
                                                                <img
                                                                    src={event.image}
                                                                    alt={event.title}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                                    {event.category.substring(0, 3)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 leading-snug">{event.title}</p>
                                                            <p className="text-xs text-slate-400 truncate max-w-xs">{event.location}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                                                        {event.category}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4 text-xs">
                                                    <p className="font-semibold text-slate-800">
                                                        {new Date(event.date).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-slate-400">{event.time || '10:00 AM'}</p>
                                                </td>

                                                <td className="py-4 px-4 font-bold text-slate-900 text-xs">
                                                    {event.ticketPrice === 0 ? (
                                                        <span className="text-emerald-600">FREE</span>
                                                    ) : (
                                                        `₹${event.ticketPrice}`
                                                    )}
                                                </td>

                                                <td className="py-4 px-4">
                                                    <div className="w-32">
                                                        <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                                                            <span>{event.availableSeats}</span>
                                                            <span className="text-slate-400">/ {event.totalSeats}</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    event.availableSeats <= 0
                                                                        ? 'bg-rose-500'
                                                                        : event.availableSeats < 15
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-emerald-500'
                                                                }`}
                                                                style={{ width: `${Math.min(100, (event.availableSeats / event.totalSeats) * 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEventToEdit(event);
                                                                setIsEventModalOpen(true);
                                                            }}
                                                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                                                            title="Edit Event"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => setEventToDelete(event)}
                                                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                                                            title="Delete Event"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SECTION 2: ATTENDEE BOOKINGS */}
            {activeSection === 'bookings' && (
                <div>
                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
                        <div className="relative flex-grow max-w-md">
                            <FaSearch className="absolute left-4 top-3.5 text-slate-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Search by attendee, email, ref, or event title..."
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                                value={bookingSearch}
                                onChange={(e) => setBookingSearch(e.target.value)}
                            />
                        </div>

                        {/* Status Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setBookingFilter(status)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition ${
                                        bookingFilter === status
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredBookings.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                            <p className="text-slate-500 font-medium">No bookings found matching current filters.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
                                        <tr>
                                            <th className="py-3.5 px-6">Reference & Event</th>
                                            <th className="py-3.5 px-4">Attendee</th>
                                            <th className="py-3.5 px-4">Seats & Amount</th>
                                            <th className="py-3.5 px-4">Status</th>
                                            <th className="py-3.5 px-6 text-right">Approval Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredBookings.map((booking) => {
                                            const ref = booking.bookingReference || `ES-${booking._id?.substring(0, 8).toUpperCase()}`;
                                            const isPending = booking.status === 'pending';

                                            return (
                                                <tr key={booking._id} className="hover:bg-slate-50/80 transition">
                                                    <td className="py-4 px-6">
                                                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                                            {ref}
                                                        </span>
                                                        <p className="font-bold text-slate-900 mt-1 leading-snug">
                                                            {booking.eventId?.title || 'Deleted Event'}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400">
                                                            {new Date(booking.bookedAt || booking.createdAt).toLocaleString()}
                                                        </p>
                                                    </td>

                                                    <td className="py-4 px-4 text-xs">
                                                        <p className="font-bold text-slate-900">{booking.userId?.name || 'Guest'}</p>
                                                        <p className="text-slate-400">{booking.userId?.email}</p>
                                                    </td>

                                                    <td className="py-4 px-4 text-xs">
                                                        <p className="font-semibold text-slate-800">
                                                            {booking.quantity || 1} Seat{(booking.quantity || 1) > 1 ? 's' : ''}
                                                        </p>
                                                        <p className="font-bold text-slate-900">
                                                            {booking.amount === 0 ? <span className="text-emerald-600">FREE</span> : `₹${booking.amount}`}
                                                        </p>
                                                    </td>

                                                    <td className="py-4 px-4">
                                                        <div className="flex flex-col gap-1 items-start">
                                                            <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                                                                booking.status === 'confirmed'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : booking.status === 'pending'
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : 'bg-rose-100 text-rose-800'
                                                            }`}>
                                                                {booking.status}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 capitalize">
                                                                {booking.paymentStatus?.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-6 text-right">
                                                        {isPending ? (
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => handleConfirmBooking(booking._id, 'paid')}
                                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1"
                                                                    title="Approve as Paid"
                                                                >
                                                                    <FaCheck className="text-[10px]" /> Paid
                                                                </button>
                                                                <button
                                                                    onClick={() => handleConfirmBooking(booking._id, 'not_paid')}
                                                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
                                                                    title="Approve (Pending Payment)"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => setBookingToCancel(booking)}
                                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                                    title="Reject"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 font-medium">Completed</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Event Form Modal (Create & Edit) */}
            <EventFormModal
                isOpen={isEventModalOpen}
                eventToEdit={eventToEdit}
                onSave={handleSaveEvent}
                onClose={() => {
                    setIsEventModalOpen(false);
                    setEventToEdit(null);
                }}
                loading={modalLoading}
            />

            {/* Delete Event Confirmation Modal */}
            <ConfirmModal
                isOpen={Boolean(eventToDelete)}
                title="Delete Event"
                message={`Are you sure you want to permanently delete "${eventToDelete?.title}"? All existing bookings for this event will be marked as cancelled.`}
                confirmText="Yes, Delete Event"
                cancelText="Keep Event"
                isDanger={true}
                onConfirm={handleConfirmDeleteEvent}
                onClose={() => setEventToDelete(null)}
            />

            {/* Reject Booking Confirmation Modal */}
            <ConfirmModal
                isOpen={Boolean(bookingToCancel)}
                title="Reject Booking Request"
                message={`Reject reservation for attendee "${bookingToCancel?.userId?.name}"?`}
                confirmText="Reject Booking"
                cancelText="Back"
                isDanger={true}
                onConfirm={handleConfirmRejectBooking}
                onClose={() => setBookingToCancel(null)}
            />
        </div>
    );
};

export default AdminDashboard;