/**
 * Dashboard TypeScript interfaces
 */

/** Raw log entry from API response */
export interface ApiLogEntry {
    id: number;
    logidx: string;
    tc_name: string;
    log_date: string;
    value_0: number;
    value_1: number;
    event_time: string;
}

/** API response shape for getDashboardStats */
export interface ApiDashboardResponse {
    status: string;
    data: {
        logs: ApiLogEntry[];
    };
}

/** Transformed location data for dashboard display */
export interface Location {
    id: string;
    locationId: string;
    location: string;
    temperature: number;
    humidity: number;
    lastUpdate: string;
    status: string;
    chartData: number[];
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
