import { create } from 'zustand';

/**
 * Default warning thresholds for temperature and humidity
 */
export const DEFAULT_THRESHOLDS = {
    tempMin: 18,
    tempMax: 28,
    humMin: 40,
    humMax: 60
};

/**
 * Load thresholds from localStorage or return defaults
 */
const loadThresholds = () => {
    if (typeof window === 'undefined') return DEFAULT_THRESHOLDS;

    try {
        const stored = localStorage.getItem('warningThresholds');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Validate that all required fields exist
            if (
                typeof parsed.tempMin === 'number' &&
                typeof parsed.tempMax === 'number' &&
                typeof parsed.humMin === 'number' &&
                typeof parsed.humMax === 'number'
            ) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Failed to load thresholds from localStorage:', e);
    }

    return DEFAULT_THRESHOLDS;
};

/**
 * Settings store - manages warning threshold configuration
 * Persists settings to localStorage for persistence across sessions
 */
export const useSettingsStore = create((set, get) => ({
    thresholds: loadThresholds(),

    /**
     * Update thresholds and persist to localStorage
     * @param {Partial<typeof DEFAULT_THRESHOLDS>} newThresholds 
     */
    updateThresholds: (newThresholds) => {
        set((state) => {
            const updated = { ...state.thresholds, ...newThresholds };
            localStorage.setItem('warningThresholds', JSON.stringify(updated));
            return { thresholds: updated };
        });
    },

    /**
     * Reset thresholds to default values
     */
    resetThresholds: () => {
        localStorage.setItem('warningThresholds', JSON.stringify(DEFAULT_THRESHOLDS));
        set({ thresholds: DEFAULT_THRESHOLDS });
    }
}));
