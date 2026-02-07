// Example integration test for auth routes
const request = require('supertest');
const app = require('../../src/app');

describe('Auth Routes', () => {
    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.user.email).toBe('test@example.com');
        });

        it('should reject duplicate email', async () => {
            // First registration
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test User',
                    email: 'duplicate@example.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                });

            // Second registration with same email
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Another User',
                    email: 'duplicate@example.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login existing user', async () => {
            // Register first
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Login Test',
                    email: 'login@example.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                });

            // Login
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.token).toBeDefined();
        });
    });
});
