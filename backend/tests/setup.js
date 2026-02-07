// Test setup file
const { sequelize } = require('../src/config/database');

// Setup before all tests
beforeAll(async () => {
    // Connect to test database
    await sequelize.authenticate();
});

// Cleanup after all tests
afterAll(async () => {
    // Close database connection
    await sequelize.close();
});

// Reset database between tests (optional)
beforeEach(async () => {
    // Add any per-test setup here
});

afterEach(async () => {
    // Add any per-test cleanup here
});
