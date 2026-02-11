/**
 * User interface
 */
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'moderator';
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * DataLog interface
 */
export interface TLog {
    id: number;
    logidx: string;
    tc_name: string;
    log_date: Date;
    value_0: number;
    value_1: number;
    event_time: string;
}
/**
 * Login credentials
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Register data
 */
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

/**
 * Auth response
 */
export interface AuthResponse {
    status: 'success' | 'fail';
    data: {
        user: User;
    };
    token: string;
}

/**
 * Auth state
 */
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}
