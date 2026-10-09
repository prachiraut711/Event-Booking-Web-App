import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import { ProtectedRoute, AdminRoute } from './components/RouteGuards';
import { FaTicketAlt, FaArrowLeft } from 'react-icons/fa';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-orange-500 selection:text-white">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/events/:id" element={<EventDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Attendee Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <UserDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/payment-success"
                            element={
                                <ProtectedRoute>
                                    <PaymentSuccess />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/payment-failed"
                            element={
                                <ProtectedRoute>
                                    <PaymentFailed />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Administrator Route */}
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            }
                        />

                        {/* 404 Route */}
                        <Route
                            path="*"
                            element={
                                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                                    <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center text-2xl mb-4">
                                        <FaTicketAlt />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-orange-600 mb-2">404 Error</span>
                                    <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Page Not Found</h1>
                                    <p className="text-slate-500 text-sm max-w-sm mb-6">
                                        The page or event link you are looking for does not exist or may have been relocated.
                                    </p>
                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl text-sm transition shadow-md"
                                    >
                                        <FaArrowLeft className="text-xs" /> Back to Home
                                    </Link>
                                </div>
                            }
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;