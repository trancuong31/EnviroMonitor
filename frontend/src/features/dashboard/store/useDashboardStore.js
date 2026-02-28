import { create } from 'zustand';
import { getDashboardStats } from '../api/dashboardApi';

/**
 * Dashboard store using Zustand
 */
export const useDashboardStore = create((set) => ({
    // State
    stats: null,
    locations: [],
    sensors: [],
    alerts: [],
    isLoading: false,
    error: null,

    // Actions
    setStats: (stats) => set({ stats }),
    setLocations: (locations) => set({ locations }),
    setSensors: (sensors) => set({ sensors }),
    setAlerts: (alerts) => set({ alerts }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    /**
     * Fetch locations from API (full replace, used for initial load)
     * @param {string} factory - factory prefix filter (e.g. 'V4', 'all')
     */
    fetchLocations: async (factory) => {
        set({ isLoading: true, error: null });
        try {
            const locations = await getDashboardStats(factory);
            set({ locations, isLoading: false });
        } catch (error) {
            set({ error: error.message || 'Failed to fetch data', isLoading: false });
        }
    },

    /**
     * Refresh locations - merge new data into existing items in-place
     * so individual cards update smoothly without re-mounting the list
     * @param {string} factory - factory prefix filter (e.g. 'V4', 'all')
     */
    refreshLocations: async (factory) => {
        try {
            const newLocations = await getDashboardStats(factory);
            set((state) => {
                const existingMap = new Map(state.locations.map((loc) => [loc.id, loc]));
                const merged = newLocations.map((newLoc) => {
                    const existing = existingMap.get(newLoc.id);
                    if (existing) {
                        // Update values in-place, keep chartData stable
                        return { ...existing, ...newLoc, chartData: existing.chartData };
                    }
                    return newLoc;
                });
                return { locations: merged, error: null };
            });
        } catch (error) {
            // Silent fail on background refresh to avoid disrupting UI
            console.error('Background refresh failed:', error);
        }
    },

    // Reset
    reset: () =>
        set({
            stats: null,
            locations: [],
            sensors: [],
            alerts: [],
            isLoading: false,
            error: null,
        }),
}));
