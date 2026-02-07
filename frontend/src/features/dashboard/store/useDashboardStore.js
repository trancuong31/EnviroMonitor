import { create } from 'zustand';

/**
 * Dashboard store using Zustand
 */
export const useDashboardStore = create((set) => ({
    // State
    stats: null,
    sensors: [],
    alerts: [],
    isLoading: false,
    error: null,

    // Actions
    setStats: (stats) => set({ stats }),
    setSensors: (sensors) => set({ sensors }),
    setAlerts: (alerts) => set({ alerts }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // Reset
    reset: () =>
        set({
            stats: null,
            sensors: [],
            alerts: [],
            isLoading: false,
            error: null,
        }),
}));
