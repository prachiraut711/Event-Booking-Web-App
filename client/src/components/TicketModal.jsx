import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { FaTimes, FaPrint, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCheckCircle, FaUser, FaTicketAlt, FaTimesCircle } from 'react-icons/fa';

const TicketModal = ({ isOpen, booking, onClose, onCancel }) => {
    const [qrDataUrl, setQrDataUrl] = useState('');

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Generate valid, standards-compliant, scannable QR code
    useEffect(() => {
        if (booking) {
            const ref = booking.bookingReference || `ES-${booking._id?.substring(0, 8).toUpperCase()}`;
            const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://eventsphere.app';
            // Scannable ticket verification URL with reference (no sensitive personal info exposed)
            const payload = `${origin}/dashboard?ticketRef=${ref}`;

            QRCode.toDataURL(payload, {
                width: 256,
                margin: 1,
                color: {
                    dark: '#0F172A',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            })
            .then((url) => setQrDataUrl(url))
            .catch((err) => {
                console.error('Error generating ticket QR code:', err);
                setQrDataUrl('');
            });
        }
    }, [booking]);

    if (!isOpen || !booking) return null;

    const event = booking.eventId || {};
    const bookingRef = booking.bookingReference || `ES-${booking._id?.substring(0, 8).toUpperCase()}`;
    const formattedDate = event.date ? new Date(event.date).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : 'TBD';

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-xl w-full my-8 overflow-hidden border border-slate-100 animate-scaleUp print-only-ticket"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header bar (hidden on print) */}
                <div className="flex justify-between items-center px-6 py-4 bg-slate-900 text-white no-print">
                    <div className="flex items-center gap-2">
                        <FaTicketAlt className="text-orange-400" />
                        <span className="font-bold text-sm tracking-wide">EventSphere Digital E-Ticket Pass</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition p-1"
                        aria-label="Close ticket"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Printable Ticket Card */}
                <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/50 to-white">
                    {/* Brand banner inside ticket */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-5 mb-6">
                        <div>
                            <span className="text-xs font-black tracking-widest text-orange-600 uppercase bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                                Official Pass
                            </span>
                            <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                                EventSphere
                            </h2>
                            <p className="text-xs text-slate-500">Verified Admission Ticket</p>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                                <FaCheckCircle className="text-emerald-500 text-[10px]" /> {booking.status}
                            </span>
                            <div className="text-xs text-slate-400 mt-2 font-mono">
                                Ref: <strong className="text-slate-800">{bookingRef}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Event Highlights */}
                    <div className="mb-6">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                            {event.category || 'General Event'}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 mb-3">
                            {event.title || 'Event Details'}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2.5">
                                <FaCalendarAlt className="text-orange-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Date</p>
                                    <p className="font-semibold text-slate-800">{formattedDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <FaClock className="text-indigo-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Time</p>
                                    <p className="font-semibold text-slate-800">{event.time || '10:00 AM'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 sm:col-span-2">
                                <FaMapMarkerAlt className="text-rose-500 shrink-0" />
                                <div className="truncate">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Location</p>
                                    <p className="font-semibold text-slate-800 truncate">{event.location || 'Online'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Perforated divider visual */}
                    <div className="relative my-6 -mx-8 flex items-center justify-between no-print">
                        <div className="w-5 h-8 bg-slate-900/70 rounded-r-full -ml-1"></div>
                        <div className="flex-grow border-t-2 border-dashed border-slate-200 mx-3"></div>
                        <div className="w-5 h-8 bg-slate-900/70 rounded-l-full -mr-1"></div>
                    </div>

                    {/* Attendee & QR Section */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                        <div className="space-y-2 text-sm w-full sm:w-auto">
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <FaUser className="text-slate-400 text-xs" />
                                <span>Attendee: <strong className="text-slate-900">{booking.userId?.name || 'Verified Guest'}</strong></span>
                            </div>
                            <div className="text-xs text-slate-500">
                                Email: {booking.userId?.email || 'N/A'}
                            </div>
                            <div className="pt-2 flex flex-wrap gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block font-medium">SEATS</span>
                                    <strong className="text-slate-900 text-sm">{booking.quantity || 1} Ticket{(booking.quantity || 1) > 1 ? 's' : ''}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">AMOUNT</span>
                                    <strong className="text-slate-900 text-sm">
                                        {booking.amount === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${booking.amount}`}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">PAYMENT</span>
                                    <span className="font-semibold text-slate-700 capitalize">{booking.paymentStatus?.replace('_', ' ')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Valid, Scannable QR Code */}
                        <div className="flex flex-col items-center shrink-0">
                            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                                {qrDataUrl ? (
                                    <img
                                        src={qrDataUrl}
                                        alt={`Scannable QR code for ticket ${bookingRef}`}
                                        className="w-24 h-24 object-contain mx-auto"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono">
                                        Loading QR...
                                    </div>
                                )}
                                <span className="block text-[10px] font-mono text-slate-700 font-bold mt-1 tracking-wider">{bookingRef}</span>
                                <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">SCAN AT GATE</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls (hidden on print) */}
                <div className="p-4 sm:p-6 bg-slate-100 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 no-print">
                    <p className="text-xs text-slate-500">
                        Present this pass or digital QR at the venue entrance.
                    </p>
                    <div className="flex items-center gap-2">
                        {booking.status === 'confirmed' && onCancel && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onCancel(booking);
                                }}
                                className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition flex items-center gap-1.5"
                            >
                                <FaTimesCircle /> Cancel Booking
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="print-keep flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition"
                        >
                            <FaPrint /> Print / Save Ticket
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl font-semibold text-sm transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketModal;
