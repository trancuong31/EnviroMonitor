/**
 * Dashboard TypeScript interfaces
 */

export interface DashboardStats {
    airQuality: {
        status: string;
        aqi: number;
    };
    temperature: {
        value: number;
        humidity: number;
    };
    waterQuality: {
        status: string;
        ph: number;
    };
    noiseLevel: {
        value: number;
        status: string;
    };
}

export interface Sensor {
    id: string;
    name: string;
    type: 'air' | 'water' | 'temperature' | 'noise';
    status: 'active' | 'inactive' | 'error';
    lastReading: number;
    lastUpdated: string;
}

export interface Alert {
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    createdAt: string;
    isRead: boolean;
}
