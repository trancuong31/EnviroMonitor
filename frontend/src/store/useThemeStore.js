import { create } from 'zustand';

/**
 * Theme store – toggles between 'light' and 'dark' mode.
 * Persists the choice in localStorage and syncs the `dark` class on <html>.
 */
const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
};

// Initialise from localStorage (or default to light)
const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
const initialTheme = stored === 'light' ? 'light' : 'dark';
applyTheme(initialTheme);

export const useThemeStore = create((set) => ({
    theme: initialTheme,
    toggleTheme: () =>
        set((state) => {
            const next = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', next);
            applyTheme(next);
            return { theme: next };
        }),
}));
