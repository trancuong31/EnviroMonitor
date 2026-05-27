import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import api from '../services/api';

import en from './locales/en.json';
import vi from './locales/vi.json';
import kr from './locales/kr.json';

const STATIC_TRANSLATIONS = { en, vi, kr };

const LS_KEY_PREFIX = 'translations_';
const SUPPORTED_LANGS = ['vi', 'en', 'kr'];
const inFlightByLang = new Map();

function normalizeLang(lang) {
    if (!lang) return 'en';
    const base = String(lang).toLowerCase().split(/[-_]/)[0];
    return SUPPORTED_LANGS.includes(base) ? base : 'en';
}

function getActiveLang() {
    return normalizeLang(i18n.resolvedLanguage || i18n.language);
}

function safeGetItem(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

function parseCachedPayload(raw) {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        if (parsed.flatMap && typeof parsed.flatMap === 'object' && !Array.isArray(parsed.flatMap)) {
            return {
                meta: parsed.__meta || null,
                flatMap: parsed.flatMap,
            };
        }
        if (!Array.isArray(parsed)) return { meta: null, flatMap: parsed };
        return null;
    } catch {
        return null;
    }
}

function shallowEqualFlatMap(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
        if (a[k] !== b[k]) return false;
    }
    return true;
}

function isPlainObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

function clonePlainObject(obj) {
    if (!obj) return {};
    try {
        if (typeof structuredClone === 'function') return structuredClone(obj);
    } catch {
        // ignore
    }
    return JSON.parse(JSON.stringify(obj));
}

function mergeDeep(target, source) {
    for (const [key, value] of Object.entries(source)) {
        if (isPlainObject(value) && isPlainObject(target[key])) {
            mergeDeep(target[key], value);
        } else {
            target[key] = value;
        }
    }
    return target;
}

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

function sanitizeFlatMap(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
    const flatMap = {};
    for (const [key, rawValue] of Object.entries(input)) {
        if (!key) continue;
        if (rawValue === null || rawValue === undefined) continue;
        const value = String(rawValue);
        if (value.trim() === '') continue;
        flatMap[key] = value;
    }
    return flatMap;
}

function applyFlatMap(lang, flatMap) {
    const normalized = normalizeLang(lang);
    const base = STATIC_TRANSLATIONS[normalized] || STATIC_TRANSLATIONS.en || {};
    const cleanFlatMap = sanitizeFlatMap(flatMap);
    const overrides = flatToNested(cleanFlatMap);

    const merged = mergeDeep(clonePlainObject(base), overrides);
    i18n.addResourceBundle(normalized, 'translation', merged, true, true);
}

function readCachedFlatMap(lang) {
    const normalized = normalizeLang(lang);
    const cached = safeGetItem(LS_KEY_PREFIX + normalized);
    const payload = parseCachedPayload(cached);
    return payload?.flatMap || null;
}

function loadCachedTranslations(lang) {
    try {
        const normalized = normalizeLang(lang);
        const cached = safeGetItem(LS_KEY_PREFIX + normalized);
        const payload = parseCachedPayload(cached);
        if (!payload?.flatMap) return { found: false, expired: false, flatMap: null };

        const cleanFlatMap = sanitizeFlatMap(payload.flatMap);
        if (Object.keys(cleanFlatMap).length > 0) {
            applyFlatMap(normalized, cleanFlatMap);
            return { found: true, flatMap: cleanFlatMap };
        }

        // Cache exists but doesn't contain usable overrides
        return { found: false, flatMap: null };
    } catch (error) {
        console.error('[i18n] Error loading cached translations:', error);
        return { found: false, expired: false, flatMap: null };
    }
}

/**
 * Fetch translations from API for a given language, cache in localStorage,
 * and merge into i18next (DB values override static JSON)
 * @param {string} lang - Language code ('vi', 'en', 'kr')
 */
export async function loadTranslationsFromAPI(lang, options = {}) {
    const normalized = normalizeLang(lang);
    if (!SUPPORTED_LANGS.includes(normalized)) return;

    if (inFlightByLang.has(normalized)) return inFlightByLang.get(normalized);

    const task = (async () => {
        try {
            const beforeFlatMap =
                options.compareToCache === true ? sanitizeFlatMap(readCachedFlatMap(normalized)) : null;

            const res = await api.get(`/translations/${normalized}`);
            const list = res.data?.data?.listTranslations || [];

            const flatMapRaw = {};
            for (const item of list) {
                const key = item.DESCRIPTION;
                if (!key) continue;

                const rawValue = item[normalized.toUpperCase()] ?? item[normalized];
                if (rawValue === null || rawValue === undefined) continue;
                flatMapRaw[key] = rawValue;
            }

            const flatMap = sanitizeFlatMap(flatMapRaw);

            const changed =
                options.compareToCache === true ? !shallowEqualFlatMap(beforeFlatMap, flatMap) : true;

            // Merge into i18next (deep merge, overwrite existing keys)
            if (changed) applyFlatMap(normalized, flatMap);

            // Persist to localStorage (best-effort; don't block UI updates)
            if (options.persist !== false) {
                const payload = { flatMap };
                safeSetItem(LS_KEY_PREFIX + normalized, JSON.stringify(payload));
            }

            return flatMap;
        } catch (error) {
            console.error(`[i18n] Error fetching translations for "${normalized}":`, error);
            return null;
        } finally {
            inFlightByLang.delete(normalized);
        }
    })();

    inFlightByLang.set(normalized, task);
    return task;
}

export async function refreshTranslations(lang, options = {}) {
    const normalized = normalizeLang(lang);
    if (!SUPPORTED_LANGS.includes(normalized)) return;

    const cacheInfo = loadCachedTranslations(normalized);
    const shouldFetch = options.force === true || !cacheInfo.found || cacheInfo.expired;

    if (shouldFetch) {
        return loadTranslationsFromAPI(normalized, { compareToCache: true, ...options });
    }
    return null;
}

export async function refreshCurrentTranslations(options = {}) {
    return refreshTranslations(getActiveLang(), options);
}

/**
 * Check if translations are cached for a language
 * @param {string} lang - Language code
 * @returns {boolean}
 */
export function isTranslationsCached(lang) {
    const normalized = normalizeLang(lang);
    return !!safeGetItem(LS_KEY_PREFIX + normalized);
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
        returnEmptyString: false,
        react: {
            bindI18nStore: 'added',
        },
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },
    });

// On init: load cached translations for the active language and refresh in background if needed
loadCachedTranslations(getActiveLang());
// Background fetch latest and apply only if changed
refreshCurrentTranslations({ force: true, compareToCache: true }).catch(() => {});

// On language change: apply cached overrides immediately, then refresh from API if stale/missing
i18n.on('languageChanged', (lang) => {
    const normalized = normalizeLang(lang);
    const cacheInfo = loadCachedTranslations(normalized);
    const shouldFetch = !cacheInfo.found || cacheInfo.expired;
    loadTranslationsFromAPI(normalized, { force: shouldFetch, compareToCache: true }).catch(() => {});
});

export default i18n;
