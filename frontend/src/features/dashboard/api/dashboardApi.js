import api from '../../../services/api';
import formatRelativeTime from '../utils/timeUtils';
import i18next from 'i18next';
/**
 * Dashboard API functions
 */

/**
 * Map DB sensor type (C/N) to display type (FRIDGE/ROOM)
 */
const mapSensorType = (type) => {
    if (type === 'C') return 'FRIDGE';
    return 'ROOM';
};

/**
 * Transform API logs into location data for dashboard display.
 * Each log entry becomes its own location item (no grouping).
 * @param {Array} logs - raw log entries from API
 * @returns {Array} transformed location data
 */
const transformLogsToLocations = (logs) => {
    return logs.map((log) => ({
        id: String(log.id),
        locationId: log.sensorId,
        location: log.sensorId,
        // Sequelize serializes model attrs as camelCase (temperature/humidity), not DB column names
        temperature: log.temperature ?? log.TEMPERATURE,
        humidity: log.humidity ?? log.HUMIDITY,
        sensorType: mapSensorType(log.sensorType) || 'ROOM',
        lastUpdate: formatRelativeTime(log.date),
        lastUpdateISO: log.date,
        status: 'Normal',
        chartData: Array.from({ length: 7 }, () => Math.floor(Math.random() * 60) + 30),
        // Per-sensor thresholds from SENSOR table
        tempMin: log.temperatureMin,
        tempMax: log.temperatureMax,
        humMin: log.humidityMin,
        humMax: log.humidityMax,
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

export const getLogsByDateRange = async (sensorId, startDate, endDate) => {
    const response = await api.get(`/dataLogs/getLogsByDateRange?sensorId=${sensorId}&startDate=${startDate}&endDate=${endDate}`);
    const { logs } = response.data.data;
    return logs;
};

export const getAlerts = async () => {
    const response = await api.get('/alerts');
    return response.data;
};

export const getListSensors = async () => {
    const response = await api.get('/dataLogs/getListSensors');
    return response.data;
};

export const getSensorsByPrefix = async (prefix) => {
    const response = await api.get('/dataLogs/getSensorsByPrefix', { params: { prefix } });
    return response.data?.data?.sensors || [];
};

/**
 * Update per-sensor threshold settings
 */
export const updateSensorSettings = async (sensorId, settings) => {
    const response = await api.put(`/dataLogs/sensors/${sensorId}`, settings);
    return response.data?.data?.sensor || null;
};

export const getLayoutDetail = async (position) => {
    const response = await api.get('/dataLogs/getLayoutDetail', { params: { position } });
    return response.data;
};
