import { Link } from 'react-router-dom';
import { FaTimesCircle, FaArrowLeft, FaRedo } from 'react-icons/fa';

const PaymentFailed = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-rose-100">
                <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">
                    <FaTimesCircle />
                </div>

                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-rose-50 text-rose-700 border border-rose-200 mb-3">
                    Transaction Incomplete
                </span>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
                    Booking Unsuccessful
                </h1>

                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    We were unable to complete your reservation. No seats have been charged. Please check availability and retry.
                </p>

                <div className="space-y-3">
                    <Link
                        to="/"
                        className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-md text-sm"
                    >
                        <FaRedo className="text-xs" /> Try Reserving Again
                    </Link>

                    <Link
                        to="/dashboard"
                        className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-2xl transition text-sm"
                    >
                        <FaArrowLeft className="text-xs" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;