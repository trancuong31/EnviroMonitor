import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT, 10) || 30000;

/**
 * Axios instance with interceptors
 */
const api = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage (zustand persisted state)
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            try {
                const { state } = JSON.parse(authStorage);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            } catch (e) {
                console.error('Error parsing auth storage:', e);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 - Unauthorized
        if (error.response?.status === 401) {
            // Clear auth storage and redirect to home
            localStorage.removeItem('auth-storage');
            window.location.href = '/';
        }

        return Promise.reject(error);
    }
);



export default api;
