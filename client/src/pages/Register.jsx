import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaTicketAlt, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useContext(AuthContext);
    const toast = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match. Please re-enter.');
            setLoading(false);
            return;
        }

        try {
            await register(name, email, password);
            toast.success('Account created successfully! Welcome to EventSphere.');
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed');
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
                        Create an Account
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Join EventSphere to discover premier experiences
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-2xl mb-6 font-medium leading-relaxed">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Full Name
                        </label>
                        <div className="relative flex items-center">
                            <FaUser className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                            <input
                                type="text"
                                required
                                placeholder="Alex Johnson"
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition placeholder-slate-400 shadow-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Email Address */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Email Address
                        </label>
                        <div className="relative flex items-center">
                            <FaEnvelope className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                            <input
                                type="email"
                                required
                                placeholder="alex@example.com"
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition placeholder-slate-400 shadow-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Password (Min 6 Characters)
                        </label>
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

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative flex items-center">
                            <FaLock className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                placeholder="••••••••"
                                className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition placeholder-slate-400 shadow-sm"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3.5 p-1.5 text-slate-400 hover:text-slate-600 transition"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl shadow-md transition disabled:opacity-50 text-sm tracking-wide mt-2"
                    >
                        {loading ? 'Creating Account...' : 'Create My Account'}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-slate-900 hover:underline">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;