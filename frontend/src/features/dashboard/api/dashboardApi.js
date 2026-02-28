import api from '../../../services/api';
import formatRelativeTime from '../utils/timeUtils';
import i18next from 'i18next';
/**
 * Dashboard API functions
 */

/**
 * Transform API logs into location data for dashboard display.
 * Each log entry becomes its own location item (no grouping).
 * @param {Array} logs - raw log entries from API
 * @returns {Array} transformed location data
 */
const transformLogsToLocations = (logs) => {
    return logs.map((log) => ({
        id: String(log.id),
        locationId: log.logidx,
        location: log.tc_name,
        temperature: log.value_0,
        humidity: log.value_1,
        lastUpdate: formatRelativeTime(log.log_date),
        lastUpdateISO: log.log_date,
        status: i18next.t('dashboard.normal', 'Normal'),
        chartData: Array.from({ length: 7 }, () => Math.floor(Math.random() * 60) + 30),
    }));
};

/**
 * Fetch dashboard logs and transform into location data
 */
export const getDashboardStats = async (factory) => {
    const params = {};
    if (factory && factory !== 'all') params.factory = factory;
    const response = await api.get('/dataLogs/getLogs', { params });
    const { logs } = response.data.data;
    return transformLogsToLocations(logs);
};

export const getLogsByDateRange = async (logidx, startDate, endDate) => {
    const response = await api.get(`/dataLogs/getLogsByDateRange?logidx=${logidx}&startDate=${startDate}&endDate=${endDate}`);
    const { logs } = response.data.data;
    return logs;
};

export const getAlerts = async () => {
    const response = await api.get('/alerts');
    return response.data;
};
