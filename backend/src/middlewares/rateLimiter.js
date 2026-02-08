const rateLimit = require('express-rate-limit');
const { HTTP_CODES } = require('../constants/httpCodes');
const env = require('../config/env');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    message: {
        status: 'fail',
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication routes
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: {
        status: 'fail',
        message: 'Too many login attempts, please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter,
};
