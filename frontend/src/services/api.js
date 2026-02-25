import axios from 'axios';
import { useAuthStore } from '@/store';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT, 10) || 30000;
const API_URL_LOCAL = import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:8888/api/v1';
const API_URL_PUBLIC = import.meta.env.VITE_API_URL_PUBLIC || API_URL_LOCAL;

const hostname = window.location.hostname;
const isLocal =
    hostname === 'localhost' ||
    hostname.startsWith('192.168.');

const baseURL = isLocal ? API_URL_LOCAL : API_URL_PUBLIC;

const api = axios.create({
    baseURL,
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
    res => res,
    error => {

        if (error.response?.status === 401) {

            useAuthStore.getState().logout();
        }

        return Promise.reject(error);
    }
);



export default api;
