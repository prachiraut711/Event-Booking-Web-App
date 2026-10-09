import { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FaTicketAlt, FaBars, FaTimes, FaUser, FaSignOutAlt, FaShieldAlt, FaChevronDown } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        toast.info('You have been signed out.');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-indigo-900/40 group-hover:scale-105 transition-transform">
                            <FaTicketAlt className="text-lg rotate-[-15deg]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1">
                                Event<span className="text-orange-500">Sphere</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase -mt-1 hidden sm:block">
                                Premier Event Platform
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                        <Link
                            to="/"
                            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                                isActive('/')
                                    ? 'bg-slate-800 text-white'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            Explore Events
                        </Link>

                        {user && (
                            <Link
                                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                                    isActive('/dashboard') || isActive('/admin')
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                }`}
                            >
                                {user.role === 'admin' ? 'Admin Dashboard' : 'My Bookings'}
                            </Link>
                        )}
                    </nav>

                    {/* Desktop Auth Controls */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-3 p-1.5 pl-3 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition"
                                >
                                    <div className="text-left hidden lg:block pr-1">
                                        <p className="text-xs font-bold text-white truncate max-w-[120px]">
                                            {user.name}
                                        </p>
                                        <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">
                                            {user.role === 'admin' ? 'Administrator' : 'Attendee'}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                        {user.name ? user.name.charAt(0) : 'U'}
                                    </div>
                                    <FaChevronDown className={`text-slate-400 text-xs transition-transform duration-200 mr-1 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* User Dropdown */}
                                {userDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 text-slate-800 animate-slideIn">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Signed in as</p>
                                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium transition"
                                            >
                                                <FaTicketAlt className="text-slate-400 text-xs" />
                                                <span>My Tickets & Passes</span>
                                            </Link>

                                            {user.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 font-semibold transition"
                                                >
                                                    <FaShieldAlt className="text-indigo-500 text-xs" />
                                                    <span>Admin Management</span>
                                                </Link>
                                            )}
                                        </div>

                                        <div className="border-t border-slate-100 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-medium transition text-left"
                                            >
                                                <FaSignOutAlt className="text-rose-500 text-xs" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 rounded-xl text-sm font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-950 transition hover:-translate-y-0.5"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                            aria-label="Toggle navigation menu"
                        >
                            {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-800 animate-slideIn">
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/"
                                className={`px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                                    isActive('/') ? 'bg-slate-800 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/60'
                                }`}
                            >
                                <FaTicketAlt className="text-orange-500 text-xs" /> Explore Events
                            </Link>

                            {user ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                                            isActive('/dashboard') ? 'bg-slate-800 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <FaUser className="text-indigo-400 text-xs" /> My Bookings
                                    </Link>

                                    {user.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                                                isActive('/admin') ? 'bg-indigo-900/60 text-white font-bold' : 'text-indigo-300 hover:bg-slate-800/60'
                                            }`}
                                        >
                                            <FaShieldAlt className="text-indigo-400 text-xs" /> Admin Dashboard
                                        </Link>
                                    )}

                                    <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between items-center px-4">
                                        <div>
                                            <p className="text-xs font-bold text-white">{user.name}</p>
                                            <p className="text-[10px] text-slate-400">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold transition flex items-center gap-1.5"
                                        >
                                            <FaSignOutAlt /> Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-slate-800">
                                    <Link
                                        to="/login"
                                        className="text-center py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-white hover:bg-slate-700 transition"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="text-center py-2.5 rounded-xl text-sm font-bold bg-orange-600 text-white hover:bg-orange-500 transition"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;