import { useLocation, Link } from 'react-router-dom';
import { FaCheckCircle, FaTicketAlt, FaCalendarCheck, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

const PaymentSuccess = () => {
    const location = useLocation();
    const state = location.state || {};
    const booking = state.booking || {};
    const bookingRef = state.bookingReference || booking.bookingReference || 'ES-CONFIRMED';
    const eventTitle = state.eventTitle || booking.eventId?.title || 'Your Event';
    const quantity = state.quantity || booking.quantity || 1;
    const amount = state.amount !== undefined ? state.amount : (booking.amount || 0);

    return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-slate-100 relative overflow-hidden animate-scaleUp">
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-50 pointer-events-none"></div>

                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-md shadow-emerald-100">
                    <FaCheckCircle />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                    <FaShieldAlt className="text-[10px]" /> Reservation Confirmed
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
                    You're Going!
                </h1>

                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    Your tickets for <strong className="text-slate-900">{eventTitle}</strong> have been secured. A confirmation notice has been dispatched.
                </p>

                {/* Booking Receipt Summary Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-left mb-8 space-y-2 text-xs">
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">Booking Reference</span>
                        <span className="font-mono font-black text-slate-900 text-sm">{bookingRef}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Tickets Reserved</span>
                        <span className="font-bold text-slate-800">{quantity} Seat{quantity > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Total Paid</span>
                        <span className="font-black text-slate-900">
                            {amount === 0 ? <span className="text-emerald-600">FREE</span> : `₹${amount}`}
                        </span>
                    </div>
                    <div className="flex justify-between pt-1">
                        <span className="text-slate-500 font-medium">Status</span>
                        <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">Verified Admission</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        to="/dashboard"
                        className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-md hover:shadow-lg text-sm"
                    >
                        <FaTicketAlt /> Access Digital E-Ticket & Pass
                    </Link>

                    <Link
                        to="/"
                        className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-2xl transition text-sm"
                    >
                        <span>Explore More Events</span> <FaArrowRight className="text-xs" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;