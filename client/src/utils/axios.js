import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle token expiration or unauthorized state
        if (error.response && error.response.status === 401) {
            const isAuthRoute = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/register');
            if (!isAuthRoute) {
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                // Trigger event so AuthContext can clean state without hard reload if listening
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;