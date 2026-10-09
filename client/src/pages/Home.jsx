import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaSearch,
    FaTicketAlt,
    FaShieldAlt,
    FaBolt,
    FaFilter,
    FaClock,
    FaTimes,
    FaArrowRight
} from 'react-icons/fa';

const CATEGORIES = [
    'All',
    'Technology',
    'Music',
    'Business',
    'Art',
    'Workshops',
    'Sports'
];

const Home = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('upcoming');
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search.trim()) params.append('search', search.trim());
            if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
            if (sortBy) params.append('sort', sortBy);

            const { data } = await api.get(`/events?${params.toString()}`);
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }, [search, selectedCategory, sortBy]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEvents();
        }, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [fetchEvents]);

    const handleClearFilters = () => {
        setSearch('');
        setSelectedCategory('All');
        setSortBy('upcoming');
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl overflow-hidden mb-12 shadow-2xl border border-slate-800">
                {/* Background ambient lighting */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"></div>

                <div className="relative p-6 sm:p-12 md:p-20 text-center flex flex-col items-center z-10">
                    <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-slate-700 text-orange-400">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                        Premier Event Experience
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight max-w-4xl">
                        Discover & Secure <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                            Unforgettable Moments
                        </span>
                    </h1>

                    <p className="text-slate-300 text-sm sm:text-lg md:text-xl mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
                        Connect with game-changing technology conferences, stadium music concerts, exclusive founder summits, and creative masterclasses.
                    </p>

                    {/* Integrated Search Input */}
                    <div className="w-full max-w-2xl mx-auto relative flex items-center shadow-2xl">
                        <FaSearch className="absolute left-5 sm:left-6 text-slate-400 text-lg pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by event title, topic, or venue..."
                            className="w-full pl-13 sm:pl-16 pr-12 py-4 sm:py-5 rounded-2xl text-sm sm:text-base text-slate-900 bg-white/95 backdrop-blur-md border border-slate-200 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all font-medium placeholder-slate-400 shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 text-slate-400 hover:text-slate-600 p-1"
                                aria-label="Clear search"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Value Proposition Features Banner */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4 hover:border-slate-300 transition group">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                        <FaBolt />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-base mb-1">Instant Seat Reservation</h3>
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Atomic seat reservations lock your ticket instantly without inventory conflicts.</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4 hover:border-slate-300 transition group">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                        <FaTicketAlt />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-base mb-1">Digital QR E-Tickets</h3>
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Receive scannable admission passes directly in your dashboard with live reference codes.</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4 hover:border-slate-300 transition group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                        <FaShieldAlt />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-base mb-1">Authenticated Security</h3>
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">2FA email OTP authorization and protected JWT role-based access control.</p>
                    </div>
                </div>
            </section>

            {/* Discovery Control Bar: Category Pills & Sorting */}
            <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2 shrink-0">
                            <FaFilter className="text-[10px]" /> Category:
                        </span>
                        {CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
                                    selectedCategory === category
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Sort By:
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        >
                            <option value="upcoming">Upcoming Soonest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="seats">Most Seats Available</option>
                            <option value="newest">Recently Added</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Results Header */}
            <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Explore Events</span>
                    {!loading && (
                        <span className="text-xs font-bold bg-slate-200/80 text-slate-700 px-2.5 py-0.5 rounded-full">
                            {events.length}
                        </span>
                    )}
                </h2>

                {(search || selectedCategory !== 'All' || sortBy !== 'upcoming') && (
                    <button
                        onClick={handleClearFilters}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline transition"
                    >
                        Reset Filters
                    </button>
                )}
            </div>

            {/* Events Grid / Skeletons */}
            {loading ? (
                /* Skeleton Loader Cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col h-[400px]">
                            <div className="h-48 bg-slate-200"></div>
                            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                </div>
                                <div className="h-10 bg-slate-200 rounded-xl"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : events.length === 0 ? (
                /* Clean Empty State */
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto my-12">
                    <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center text-2xl mx-auto mb-4">
                        <FaSearch />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Matching Events Found</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                        We couldn't find any events matching your current filters. Try searching for a different keyword or category.
                    </p>
                    <button
                        onClick={handleClearFilters}
                        className="bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl text-sm transition shadow-md"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                /* Event Cards Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
                    {events.map((event) => {
                        const isSoldOut = event.availableSeats <= 0;
                        const seatPercentage = event.totalSeats > 0
                            ? Math.max(0, Math.min(100, (event.availableSeats / event.totalSeats) * 100))
                            : 0;

                        return (
                            <div
                                key={event._id}
                                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col group hover:-translate-y-1"
                            >
                                {/* Event Image Banner */}
                                <div className="h-48 bg-slate-100 overflow-hidden relative">
                                    {event.image ? (
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="w-full h-full bg-gradient-to-tr from-slate-900 to-indigo-950 text-white/80 font-black text-2xl flex items-center justify-center uppercase tracking-widest"
                                        style={{ display: event.image ? 'none' : 'flex' }}
                                    >
                                        {event.category || 'Event'}
                                    </div>

                                    {/* Price Badge */}
                                    <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black shadow-md border border-slate-100">
                                        {event.ticketPrice === 0 ? (
                                            <span className="text-emerald-600 font-extrabold tracking-wide">FREE</span>
                                        ) : (
                                            <span className="text-slate-900 font-black">₹{event.ticketPrice}</span>
                                        )}
                                    </div>

                                    {/* Category Pill */}
                                    <div className="absolute bottom-3 left-3.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-orange-400 uppercase tracking-widest border border-white/10">
                                        {event.category}
                                    </div>
                                </div>

                                {/* Event Body */}
                                <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2.5 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                            {event.title}
                                        </h3>

                                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
                                            {event.description}
                                        </p>

                                        <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-orange-500 text-xs shrink-0" />
                                                <span className="font-medium text-slate-700">
                                                    {new Date(event.date).toLocaleDateString(undefined, {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>

                                            {event.time && (
                                                <div className="flex items-center gap-2">
                                                    <FaClock className="text-indigo-500 text-xs shrink-0" />
                                                    <span className="text-slate-600">{event.time}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 truncate">
                                                <FaMapMarkerAlt className="text-rose-500 text-xs shrink-0" />
                                                <span className="truncate text-slate-600">{event.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Availability & Booking Action */}
                                    <div className="pt-3 border-t border-slate-100 mt-auto">
                                        <div className="flex justify-between items-center text-xs mb-1.5">
                                            <span className="text-slate-500 font-medium">Availability</span>
                                            <span className={`font-bold ${isSoldOut ? 'text-rose-600' : event.availableSeats < 15 ? 'text-amber-600' : 'text-slate-700'}`}>
                                                {isSoldOut ? 'Sold Out' : `${event.availableSeats} of ${event.totalSeats} seats`}
                                            </span>
                                        </div>

                                        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    isSoldOut
                                                        ? 'bg-rose-500'
                                                        : event.availableSeats < 15
                                                        ? 'bg-amber-500'
                                                        : 'bg-emerald-500'
                                                }`}
                                                style={{ width: `${seatPercentage}%` }}
                                            ></div>
                                        </div>

                                        <Link
                                            to={`/events/${event._id}`}
                                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
                                                isSoldOut
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : 'bg-slate-900 hover:bg-black text-white shadow-sm hover:shadow group-hover:bg-orange-600'
                                            }`}
                                        >
                                            <span>{isSoldOut ? 'View Archive' : 'Book Tickets'}</span>
                                            {!isSoldOut && <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Minimal Footer */}
            <footer className="mt-auto py-8 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm mb-6">
                <div className="flex justify-center items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs">
                        <FaTicketAlt />
                    </div>
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                        Event<span className="text-orange-500">Sphere</span>
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default Home;