import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    }, []);

    // Verify token on mount with the backend
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('userInfo');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Populate optimistic state first to prevent flashing
                if (savedUser) {
                    try {
                        setUser(JSON.parse(savedUser));
                    } catch {
                        // ignore json parse error
                    }
                }
                const { data } = await api.get('/auth/me');
                setUser((prev) => ({
                    ...prev,
                    ...data,
                    token
                }));
                localStorage.setItem('userInfo', JSON.stringify({ ...JSON.parse(savedUser || '{}'), ...data, token }));
            } catch (err) {
                console.warn('Session verification notice:', err.response?.data?.message || err.message);
                if (err.response?.status === 401) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        const handleUnauthorized = () => {
            logout();
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, [logout]);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            const serverMsg = error.response?.data?.message;
            throw new Error(serverMsg || 'Registration failed. Please try again.');
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'OTP verification failed. Please try again.');
        }
    };

    const resendOTP = async (email, action = 'account_verification') => {
        try {
            const { data } = await api.post('/auth/resend-otp', { email, action });
            return data;
        } catch (error) {
            if (error.response?.status === 429) {
                throw new Error(error.response.data.message || 'Please wait before requesting another OTP');
            }
            throw new Error(error.response?.data?.message || 'Failed to resend verification code');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOTP, resendOTP, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};