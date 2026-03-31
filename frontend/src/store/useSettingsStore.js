import { create } from 'zustand';
import api from '../services/api';
import { useAuthStore } from './useAuthStore';

/**
 * Default warning thresholds for fridge and room
 */
export const DEFAULT_THRESHOLDS = {
    WHC: {
        tempMin: 0,
        tempMax: 10,
        humMin: 30,
        humMax: 100,
    },
    WHN: {
        tempMin: 20,
        tempMax: 28,
        humMin: 40,
        humMax: 60,
    },
    PL: {
        tempMin: 18,
        tempMax: 28,
        humMin: 40,
        humMax: 60,
    },
    ng: 15,
};

/**
 * Settings store - manages warning threshold configuration
 * Loads settings from DB via API /getSettings and saves via API /settings
 */
export const useSettingsStore = create((set) => ({
    WHC: { ...DEFAULT_THRESHOLDS.WHC },
    WHN: { ...DEFAULT_THRESHOLDS.WHN },
    PL: { ...DEFAULT_THRESHOLDS.PL },
    ng: DEFAULT_THRESHOLDS.ng,
    isLoading: false,

    /**
     * Fetch thresholds from API
     */
    fetchSettings: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get('/dataLogs/getSettings');
            const settings = res.data?.data?.settings || [];
            
            const newStore = { 
                WHC: { ...DEFAULT_THRESHOLDS.WHC }, 
                WHN: { ...DEFAULT_THRESHOLDS.WHN }, 
                PL: { ...DEFAULT_THRESHOLDS.PL }, 
                ng: DEFAULT_THRESHOLDS.ng 
            };
            
            settings.forEach(spec => {
                const loc = spec.location; // "WHC", "WHN", "PL"
                if (loc && newStore[loc]) {
                    if (spec.temperatureMin !== null && spec.temperatureMin !== undefined) newStore[loc].tempMin = spec.temperatureMin;
                    if (spec.temperatureMax !== null && spec.temperatureMax !== undefined) newStore[loc].tempMax = spec.temperatureMax;
                    if (spec.humidityMin !== null && spec.humidityMin !== undefined) newStore[loc].humMin = spec.humidityMin;
                    if (spec.humidityMax !== null && spec.humidityMax !== undefined) newStore[loc].humMax = spec.humidityMax;
                    if (spec.ng !== null && spec.ng !== undefined) {
                        newStore.ng = spec.ng;
                    }
                }
            });

            set({ ...newStore, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch settings', error);
            set({ isLoading: false });
        }
    },

    /**
     * Update thresholds and persist to DB via API
     * @param {'WHC' | 'WHN' | 'PL' | 'ng'} type
     * @param {object} values
     * @param {object} [rootValues={}]
     * @returns {Promise<{ success: boolean, error?: string }>}
     */
    
    updateSettings: async (type, values, rootValues = {}) => {
        set({ isLoading: true });
        const payload = {
            location: type,
            temperatureMin: values?.tempMin,
            temperatureMax: values?.tempMax,
            humidityMin: values?.humMin,
            humidityMax: values?.humMax,
            ng: rootValues?.ng
        };

        try {
            await api.put('/dataLogs/settings', payload);

            // Optimistically update local state
            set((state) => ({
                [type]: {
                    ...state[type],
                    ...values
                },
                ng: rootValues.ng !== undefined ? rootValues.ng : state.ng,
                isLoading: false
            }));

            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            const message = error.response?.data?.message || 'Failed to save settings';
            return { success: false, error: message };
        }
    },

    /**
     * Reset thresholds to default values
     * @param {'WHC' | 'WHN' | 'PL' | 'ng'} type
     */
    resetThresholds: (type) => {
        set({ [type]: { ...DEFAULT_THRESHOLDS[type] } });
    },
}));
