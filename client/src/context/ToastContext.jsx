import { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const toast = {
        success: (msg, duration) => addToast({ message: msg, type: 'success', duration }),
        error: (msg, duration) => addToast({ message: msg, type: 'error', duration }),
        warning: (msg, duration) => addToast({ message: msg, type: 'warning', duration }),
        info: (msg, duration) => addToast({ message: msg, type: 'info', duration }),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border text-sm transition-all transform animate-slideIn ${
                            t.type === 'success'
                                ? 'bg-white border-emerald-200 text-slate-800'
                                : t.type === 'error'
                                ? 'bg-white border-rose-200 text-slate-800'
                                : t.type === 'warning'
                                ? 'bg-white border-amber-200 text-slate-800'
                                : 'bg-white border-slate-200 text-slate-800'
                        }`}
                    >
                        <div className="shrink-0 mt-0.5 text-lg">
                            {t.type === 'success' && <FaCheckCircle className="text-emerald-500" />}
                            {t.type === 'error' && <FaExclamationCircle className="text-rose-500" />}
                            {t.type === 'warning' && <FaExclamationTriangle className="text-amber-500" />}
                            {t.type === 'info' && <FaInfoCircle className="text-indigo-500" />}
                        </div>
                        <div className="flex-grow font-medium leading-relaxed">{t.message}</div>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="shrink-0 text-slate-400 hover:text-slate-600 transition"
                            aria-label="Close notification"
                        >
                            <FaTimes />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
