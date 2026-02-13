const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVars = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,

    // Database
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        name: process.env.DB_NAME || 'enviromonitor',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 7,
    },

    // Email
    email: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM || 'noreply@enviromonitor.com',
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',

    // Alert System
    alert: {
        enabled: process.env.ALERT_ENABLED === 'true',
        tempMin: parseFloat(process.env.ALERT_TEMP_MIN) || 18,
        tempMax: parseFloat(process.env.ALERT_TEMP_MAX) || 28,
        humMin: parseFloat(process.env.ALERT_HUM_MIN) || 40,
        humMax: parseFloat(process.env.ALERT_HUM_MAX) || 60,
        emails: (process.env.ALERT_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean),
        checkInterval: parseInt(process.env.ALERT_CHECK_INTERVAL, 10) || 60,
    },
};

module.exports = envVars;
