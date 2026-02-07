import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3000/api/v1';

export const handlers = [
    // Auth handlers
    http.post(`${API_URL}/auth/login`, async () => {
        return HttpResponse.json({
            status: 'success',
            data: {
                user: {
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'user',
                },
            },
            token: 'mock-jwt-token',
        });
    }),

    http.post(`${API_URL}/auth/register`, async () => {
        return HttpResponse.json({
            status: 'success',
            data: {
                user: {
                    id: 1,
                    name: 'New User',
                    email: 'new@example.com',
                    role: 'user',
                },
            },
            token: 'mock-jwt-token',
        });
    }),

    // Dashboard handlers
    http.get(`${API_URL}/dashboard/stats`, () => {
        return HttpResponse.json({
            status: 'success',
            data: {
                airQuality: { status: 'Good', aqi: 45 },
                temperature: { value: 24, humidity: 65 },
                waterQuality: { status: 'Safe', ph: 7.2 },
                noiseLevel: { value: 42, status: 'Low' },
            },
        });
    }),
];
