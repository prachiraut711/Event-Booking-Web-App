import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaTicketAlt, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaKey, FaRedo } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [emailWarning, setEmailWarning] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const { login, verifyOTP, resendOTP } = useContext(AuthContext);
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // Timer countdown for resend cooldown
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setEmailWarning('');

        try {
            if (!showOTP) {
                const data = await login(email, password);
                toast.success(`Welcome back, ${data.name}!`);
                const destination = location.state?.from?.pathname || (data.role === 'admin' ? '/admin' : '/dashboard');
                navigate(destination, { replace: true });
            } else {
                const data = await verifyOTP(email, otp);
                toast.success('Account verified! Welcome to EventSphere.');
                const destination = location.state?.from?.pathname || (data.role === 'admin' ? '/admin' : '/dashboard');
                navigate(destination, { replace: true });
            }
        } catch (err) {
            if (err.needsVerification) {
                setShowOTP(true);
                setResendCooldown(60);
                if (err.emailDeliveryFailed) {
                    setEmailWarning(err.message || 'OTP email could not be delivered.');
                    setError('The verification code could not be delivered to this email address. Real OTP verification is required to sign in. Please retry sending the code or verify using an authorized email address.');
                } else {
                    setError('Your account requires verification. A 6-digit OTP has been sent to your email.');
                }
            } else {
                setError(err.message || 'Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendCooldown > 0 || !email) return;
        setLoading(true);
        setError('');
        setEmailWarning('');

        try {
            const data = await resendOTP(email, 'account_verification');
            toast.success(data.message || 'A new code has been sent.');
            setResendCooldown(60);
        } catch (err) {
            if (err.emailDeliveryFailed || err.message?.includes('deliver') || err.message?.includes('restricted') || err.message?.includes('Resend')) {
                setEmailWarning(err.message || 'Verification code could not be delivered.');
                setError('The verification code could not be delivered. Real OTP verification is required to sign in. Please check the email address or retry.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-12 px-4">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80">
                {/* Brand header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-orange-500 flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition-transform">
                            <FaTicketAlt />
                        </div>
                    </Link>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {showOTP ? 'Verify Your Account' : 'Welcome to EventSphere'}
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        {showOTP ? `Enter the 6-digit code sent to ${email}` : 'Sign in to access your tickets and events'}
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-2xl mb-6 font-medium leading-relaxed">
                        {error}
                    </div>
                )}

                {/* Email Delivery Notice Banner */}
                {emailWarning && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3.5 rounded-2xl mb-6 font-medium leading-relaxed">
                        ⚠️ <strong>Email Provider Notice:</strong> {emailWarning}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!showOTP ? (
                        <>
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Email Address
                                </label>
                                <div className="relative flex items-center">
                                    <FaEnvelope className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@example.com"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition placeholder-slate-400 shadow-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password with Eye Icon */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Password
                                    </label>
                                </div>
                                <div className="relative flex items-center">
                                    <FaLock className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition placeholder-slate-400 shadow-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 p-1.5 text-slate-400 hover:text-slate-600 transition"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* OTP Verification Field */
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                6-Digit One-Time Password
                            </label>
                            <div className="relative flex items-center">
                                <FaKey className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    placeholder="••••••"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xl font-bold tracking-widest text-center text-slate-900 transition font-mono shadow-sm"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>

                            <div className="flex justify-between items-center mt-3 text-xs">
                                <span className="text-slate-500">Didn't receive the code?</span>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resendCooldown > 0 || loading}
                                    className="font-bold text-orange-600 hover:text-orange-700 disabled:text-slate-400 transition flex items-center gap-1"
                                >
                                    <FaRedo className={`text-[10px] ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                                    <span>
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-md transition disabled:opacity-50 text-sm tracking-wide mt-2"
                    >
                        {loading ? 'Processing...' : showOTP ? 'Verify OTP & Continue' : 'Sign In'}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
                    {showOTP ? (
                        <button
                            type="button"
                            onClick={() => {
                                setShowOTP(false);
                                setError('');
                                setEmailWarning('');
                            }}
                            className="font-semibold text-slate-700 hover:underline"
                        >
                            ← Back to Sign In
                        </button>
                    ) : (
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-orange-600 hover:underline">
                                Create an account
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;