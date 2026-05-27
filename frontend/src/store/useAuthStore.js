import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import { useSettingsStore } from './useSettingsStore';

/** Set when user logs out before persist rehydration finishes (avoids stale restore). */
let logoutBeforeHydration = false;

/**
 * Auth store using Zustand
 */
export const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            hasHydrated: false,

            // Actions
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setToken: (token) => set({ token }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),

            // Login
            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const token = response.data.token;
                    const user = response.data.data.user;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    // Hydrate settings
                    useSettingsStore.getState().fetchSettings();
                    
                    // Load dynamic translations for current language
                    import('../i18n').then(({ refreshCurrentTranslations }) => {
                        refreshCurrentTranslations({ force: true }).catch(console.error);
                    });

                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Login failed';
                    set({ error: message, isLoading: false });
                    return { success: false, error: message };
                }
            },

            // Register
            register: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/register', userData);
                    const { user, token } = response.data.data || response.data;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    // Hydrate settings
                    useSettingsStore.getState().fetchSettings();
                    
                    // Load dynamic translations for current language
                    import('../i18n').then(({ refreshCurrentTranslations }) => {
                        refreshCurrentTranslations({ force: true }).catch(console.error);
                    });

                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Registration failed';
                    set({ error: message, isLoading: false });
                    return { success: false, error: message };
                }
            },

            // Logout
            logout: () => {
                if (!get().hasHydrated) {
                    logoutBeforeHydration = true;
                }
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            // Clear error
            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

const finishAuthHydration = () => {
    if (logoutBeforeHydration) {
        logoutBeforeHydration = false;
        useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            hasHydrated: true,
        });
        return;
    }
    useAuthStore.setState({ hasHydrated: true });
};

useAuthStore.persist.onFinishHydration(finishAuthHydration);

// Sync storage (e.g. localStorage) may hydrate before the listener is attached
if (useAuthStore.persist.hasHydrated()) {
    finishAuthHydration();
}
