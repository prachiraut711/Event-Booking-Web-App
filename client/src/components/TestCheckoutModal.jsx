import { useState } from 'react';
import { FaTimes, FaShieldAlt, FaCreditCard, FaLock, FaCheck } from 'react-icons/fa';

const TestCheckoutModal = ({ isOpen, event, quantity, user, onConfirm, onRequestPending, onClose, loading }) => {
    const [selectedMethod, setSelectedMethod] = useState('card');

    if (!isOpen || !event) return null;

    const unitPrice = event.ticketPrice || 0;
    const totalAmount = unitPrice * quantity;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 my-8 animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-2">
                            <FaShieldAlt className="text-[10px]" /> Test / Demo Checkout Sandbox
                        </div>
                        <h3 className="text-xl font-black tracking-tight">Complete Your Booking</h3>
                        <p className="text-xs text-slate-300 mt-1">Simulated transaction • No real charge will occur</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-slate-400 hover:text-white transition p-1"
                        aria-label="Close checkout"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Event Summary Card */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{event.category}</span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5 mb-2">{event.title}</h4>
                        <div className="flex justify-between text-xs text-slate-600 py-1 border-t border-slate-200/60">
                            <span>Ticket Price</span>
                            <span>₹{unitPrice} each</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 py-1">
                            <span>Quantity</span>
                            <span>{quantity} Seat{quantity > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 py-1">
                            <span>Platform Processing Fee</span>
                            <span className="text-emerald-600 font-semibold">FREE (₹0)</span>
                        </div>
                        <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200 mt-1">
                            <span>Total Due</span>
                            <span className="text-base text-orange-600">₹{totalAmount}</span>
                        </div>
                    </div>

                    {/* Attendee Details */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Booking For
                        </label>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-slate-900">{user?.name}</p>
                                <p className="text-slate-500">{user?.email}</p>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-semibold">Logged In</span>
                        </div>
                    </div>

                    {/* Mock Payment Selector */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Simulated Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedMethod('card')}
                                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                                    selectedMethod === 'card'
                                        ? 'border-orange-500 bg-orange-50/50 text-slate-900 ring-2 ring-orange-500/20'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FaCreditCard className="text-orange-500 text-sm" />
                                    <span className="text-xs font-bold">Demo Card</span>
                                </div>
                                {selectedMethod === 'card' && <FaCheck className="text-orange-500 text-xs" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedMethod('upi')}
                                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                                    selectedMethod === 'upi'
                                        ? 'border-orange-500 bg-orange-50/50 text-slate-900 ring-2 ring-orange-500/20'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-indigo-600 font-mono">UPI</span>
                                    <span className="text-xs font-bold">Sandbox UPI</span>
                                </div>
                                {selectedMethod === 'upi' && <FaCheck className="text-orange-500 text-xs" />}
                            </button>
                        </div>

                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 text-center font-medium">
                            This is a demo payment. No real money will be charged.
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-white transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                        {onRequestPending && (
                            <button
                                type="button"
                                onClick={onRequestPending}
                                disabled={loading}
                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold text-xs transition disabled:opacity-50"
                            >
                                Request Booking (Pending)
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition disabled:opacity-50 text-sm"
                        >
                            {loading ? (
                                <span>Confirming Reservation...</span>
                            ) : (
                                <>
                                    <FaLock className="text-xs" />
                                    <span>Confirm Test Payment • ₹{totalAmount}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestCheckoutModal;
