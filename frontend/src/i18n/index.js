import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import api from '../services/api';

import en from './locales/en.json';
import vi from './locales/vi.json';
import kr from './locales/kr.json';

const LS_KEY_PREFIX = 'translations_';
const SUPPORTED_LANGS = ['vi', 'en', 'kr'];

/**
 * Convert flat key-value map to nested object for i18next
 * e.g. { 'admin.userManagement': 'Users' } => { admin: { userManagement: 'Users' } }
 */
function flatToNested(flatMap) {
    const nested = {};
    for (const [key, value] of Object.entries(flatMap)) {
        const parts = key.split('.');
        let current = nested;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    }
    return nested;
}

function loadCachedTranslations(lang) {
    try {
        const cached = localStorage.getItem(LS_KEY_PREFIX + lang);
        if (cached) {
            const flatMap = JSON.parse(cached);
            const nested = flatToNested(flatMap);
            i18n.addResourceBundle(lang, 'translation', nested, true, true);
        }
    } catch (error) {
        console.error('[i18n] Error loading cached translations:', error);
    }
}

/**
 * Fetch translations from API for a given language, cache in localStorage,
 * and merge into i18next (DB values override static JSON)
 * @param {string} lang - Language code ('vi', 'en', 'kr')
 */
export async function loadTranslationsFromAPI(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;

    try {
        const res = await api.get(`/translations/${lang}`);
        const list = res.data?.data?.listTranslations || [];

        const flatMap = {};
        for (const item of list) {
            if (item.DESCRIPTION) {
                flatMap[item.DESCRIPTION] = item[lang.toUpperCase()] ?? item[lang] ?? '';
            }
        }

        // Persist to localStorage
        localStorage.setItem(LS_KEY_PREFIX + lang, JSON.stringify(flatMap));

        // Merge into i18next (deep merge, overwrite existing keys)
        const nested = flatToNested(flatMap);
        i18n.addResourceBundle(lang, 'translation', nested, true, true);
    } catch (error) {
        console.error(`[i18n] Error fetching translations for "${lang}":`, error);
    }
}

export async function loadAllTranslations() {
    await Promise.all(SUPPORTED_LANGS.map(loadTranslationsFromAPI));
    if (i18n.isInitialized) {
        i18n.changeLanguage(i18n.language);
    }
}

/**
 * Check if translations are cached for a language
 * @param {string} lang - Language code
 * @returns {boolean}
 */
export function isTranslationsCached(lang) {
    return !!localStorage.getItem(LS_KEY_PREFIX + lang);
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            vi: { translation: vi },
            kr: { translation: kr },
        },
        supportedLngs: ['en', 'vi', 'kr'],
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },
    });

// On init: load cached DB translations (synchronous, no API call)
SUPPORTED_LANGS.forEach(loadCachedTranslations);

// On language change: merge cached DB translations for the new language
i18n.on('languageChanged', (lang) => {
    loadCachedTranslations(lang);
});

export default i18n;
