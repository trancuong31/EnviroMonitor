import { create } from 'zustand';
import api from '../services/api';

/**
 * Default warning thresholds for fridge and room
 */
export const DEFAULT_THRESHOLDS = {
    fridge: {
        tempMin: 2,
        tempMax: 8,
        humMin: 30,
        humMax: 100,
    },
    room: {
        tempMin: 18,
        tempMax: 28,
        humMin: 40,
        humMax: 60,
    },
};

/**
 * Extract threshold values from user object
 */
const extractThresholds = (user) => {
    if (!user) return DEFAULT_THRESHOLDS;

    return {
        fridge: {
            tempMin: user.fridgeTempMin ?? DEFAULT_THRESHOLDS.fridge.tempMin,
            tempMax: user.fridgeTempMax ?? DEFAULT_THRESHOLDS.fridge.tempMax,
            humMin: user.fridgeHumMin ?? DEFAULT_THRESHOLDS.fridge.humMin,
            humMax: user.fridgeHumMax ?? DEFAULT_THRESHOLDS.fridge.humMax,
        },
        room: {
            tempMin: user.roomTempMin ?? DEFAULT_THRESHOLDS.room.tempMin,
            tempMax: user.roomTempMax ?? DEFAULT_THRESHOLDS.room.tempMax,
            humMin: user.roomHumMin ?? DEFAULT_THRESHOLDS.room.humMin,
            humMax: user.roomHumMax ?? DEFAULT_THRESHOLDS.room.humMax,
        },
    };
};

/**
 * Settings store - manages warning threshold configuration
 * Loads settings from user object (DB) and saves via API
 */
export const useSettingsStore = create((set) => ({
    fridge: { ...DEFAULT_THRESHOLDS.fridge },
    room: { ...DEFAULT_THRESHOLDS.room },
    isLoading: false,

    /**
     * Load thresholds from user object (called on login/getMe)
     */
    loadFromUser: (user) => {
        const thresholds = extractThresholds(user);
        set({ fridge: thresholds.fridge, room: thresholds.room });
    },

    /**
     * Update thresholds and persist to DB via API
     * @param {'fridge' | 'room'} type
     * @param {{ tempMin?: number, tempMax?: number, humMin?: number, humMax?: number }} values
     * @returns {Promise<{ success: boolean, error?: string }>}
     */
    updateSettings: async (type, values) => {
        set({ isLoading: true });

        // Map local field names to API field names
        const prefix = type === 'fridge' ? 'fridge' : 'room';
        const payload = {};
        if (values.tempMin !== undefined) payload[`${prefix}TempMin`] = values.tempMin;
        if (values.tempMax !== undefined) payload[`${prefix}TempMax`] = values.tempMax;
        if (values.humMin !== undefined) payload[`${prefix}HumMin`] = values.humMin;
        if (values.humMax !== undefined) payload[`${prefix}HumMax`] = values.humMax;

        try {
            const response = await api.put('/users/settings', payload);
            const user = response.data?.data?.user;

            if (user) {
                const thresholds = extractThresholds(user);
                set({ fridge: thresholds.fridge, room: thresholds.room, isLoading: false });
            } else {
                // Optimistically update local state
                set((state) => ({
                    [type]: { ...state[type], ...values },
                    isLoading: false,
                }));
            }

            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            const message = error.response?.data?.message || 'Failed to save settings';
            return { success: false, error: message };
        }
    },

    /**
     * Reset thresholds to default values
     * @param {'fridge' | 'room'} type
     */
    resetThresholds: (type) => {
        set({ [type]: { ...DEFAULT_THRESHOLDS[type] } });
    },
}));
