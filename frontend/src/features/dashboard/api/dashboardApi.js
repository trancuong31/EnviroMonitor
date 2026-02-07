import api from '../../../services/api';

/**
 * Dashboard API functions
 */

export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const getSensorData = async (sensorId) => {
    const response = await api.get(`/sensors/${sensorId}`);
    return response.data;
};

export const getAlerts = async () => {
    const response = await api.get('/alerts');
    return response.data;
};
