import i18next from 'i18next';

/**
 * Format relative time from ISO date string with i18n support
 * @param {string} isoDate - ISO date string
 * @returns {string} formatted relative time
 */
const formatRelativeTime = (isoDate) => {
    const now = new Date();
    // Server returns proper UTC (Z suffix) — parse directly, browser handles timezone
    const date = new Date(isoDate);

    const diffMs = now - date;

    // If date is in the future, show "just now"
    if (diffMs < 0) return i18next.t('time.justNow', 'vừa xong');

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return i18next.t('time.secondsAgo', '{{count}} giây trước', { count: diffSec });
    if (diffMin < 60) return i18next.t('time.minutesAgo', '{{count}} phút trước', { count: diffMin });
    if (diffHour < 24) return i18next.t('time.hoursAgo', '{{count}} giờ trước', { count: diffHour });
    return i18next.t('time.daysAgo', '{{count}} ngày trước', { count: diffDay });
};

export default formatRelativeTime;
