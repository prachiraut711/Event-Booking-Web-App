import { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTag, FaChair, FaRupeeSign, FaImage } from 'react-icons/fa';

const CATEGORIES = [
    'Technology',
    'Music',
    'Business',
    'Art',
    'Workshops',
    'Sports',
    'Networking'
];

const EventFormModal = ({ isOpen, eventToEdit, onSave, onClose, loading }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '10:00 AM',
        location: '',
        category: 'Technology',
        totalSeats: '',
        ticketPrice: '0',
        image: ''
    });

    const [imgPreviewError, setImgPreviewError] = useState(false);

    useEffect(() => {
        if (eventToEdit) {
            const formattedDate = eventToEdit.date
                ? new Date(eventToEdit.date).toISOString().split('T')[0]
                : '';
            setFormData({
                title: eventToEdit.title || '',
                description: eventToEdit.description || '',
                date: formattedDate,
                time: eventToEdit.time || '10:00 AM',
                location: eventToEdit.location || '',
                category: eventToEdit.category || 'Technology',
                totalSeats: eventToEdit.totalSeats !== undefined ? String(eventToEdit.totalSeats) : '',
                ticketPrice: eventToEdit.ticketPrice !== undefined ? String(eventToEdit.ticketPrice) : '0',
                image: eventToEdit.image || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                date: '',
                time: '10:00 AM',
                location: '',
                category: 'Technology',
                totalSeats: '',
                ticketPrice: '0',
                image: ''
            });
        }
        setImgPreviewError(false);
    }, [eventToEdit, isOpen]);

    if (!isOpen) return null;

    const isEditMode = Boolean(eventToEdit?._id);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, eventToEdit?._id);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-100 animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                            Admin Portal
                        </span>
                        <h3 className="text-xl font-black mt-1">
                            {isEditMode ? 'Edit Event Details' : 'Create New Event'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-slate-400 hover:text-white transition p-1"
                        aria-label="Close dialog"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Event Title *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Next.js & AI Developers Conference"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Category */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <FaTag className="text-slate-400 text-[10px]" /> Category *
                            </label>
                            <select
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition bg-white"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <FaCalendarAlt className="text-slate-400 text-[10px]" /> Date *
                            </label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        {/* Time */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <FaClock className="text-slate-400 text-[10px]" /> Time Slot
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 10:00 AM - 04:00 PM"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <FaMapMarkerAlt className="text-slate-400 text-[10px]" /> Venue / Location *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Innovation Hub, Bangalore or Online"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        {/* Total Seats */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <FaChair className="text-slate-400 text-[10px]" /> Total Capacity (Seats) *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="e.g. 200"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition"
                                value={formData.totalSeats}
                                onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                            />
                        </div>

                        {/* Ticket Price */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <FaRupeeSign className="text-slate-400 text-[10px]" /> Ticket Price (₹) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                placeholder="0 for Free event"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition"
                                value={formData.ticketPrice}
                                onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                            />
                            <span className="text-[11px] text-slate-400 block mt-1">Enter 0 to mark as a Free Admission event</span>
                        </div>
                    </div>

                    {/* Image URL & Preview */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <FaImage className="text-slate-400 text-[10px]" /> Cover Image Direct URL
                        </label>
                        <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition"
                            value={formData.image}
                            onChange={(e) => {
                                setFormData({ ...formData, image: e.target.value });
                                setImgPreviewError(false);
                            }}
                        />

                        {/* Image Preview thumbnail */}
                        {formData.image && !imgPreviewError && (
                            <div className="mt-2 relative w-full h-28 rounded-xl overflow-hidden border border-slate-200">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={() => setImgPreviewError(true)}
                                />
                                <span className="absolute bottom-1 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded">
                                    Preview
                                </span>
                            </div>
                        )}
                        {imgPreviewError && (
                            <p className="text-[11px] text-amber-600 mt-1">
                                Notice: Provided image link could not be loaded; a clean category placeholder will be used instead.
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Event Description *
                        </label>
                        <textarea
                            required
                            rows="4"
                            placeholder="Provide a comprehensive summary of the schedule, keynotes, topics, and venue instructions..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : isEditMode ? 'Update Event' : 'Publish Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventFormModal;
