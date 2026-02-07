// Example unit test for authService
const bcrypt = require('bcryptjs');

describe('AuthService', () => {
    describe('Password Hashing', () => {
        it('should hash password correctly', async () => {
            const password = 'testPassword123';
            const hashedPassword = await bcrypt.hash(password, 12);

            expect(hashedPassword).not.toBe(password);
            expect(hashedPassword.length).toBeGreaterThan(password.length);
        });

        it('should verify password correctly', async () => {
            const password = 'testPassword123';
            const hashedPassword = await bcrypt.hash(password, 12);

            const isValid = await bcrypt.compare(password, hashedPassword);
            expect(isValid).toBe(true);
        });

        it('should reject invalid password', async () => {
            const password = 'testPassword123';
            const hashedPassword = await bcrypt.hash(password, 12);

            const isValid = await bcrypt.compare('wrongPassword', hashedPassword);
            expect(isValid).toBe(false);
        });
    });
});
