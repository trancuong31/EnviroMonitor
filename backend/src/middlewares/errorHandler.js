const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const logger = require('../config/logger');

/**
 * Handle cast error from database
 */
const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, HTTP_CODES.BAD_REQUEST);
};

/**
 * Handle duplicate field error from database
 */
const handleDuplicateFieldsError = (err) => {
    const value = err.message.match(/(["'])(\\?.)*?\1/)?.[0] || 'value';
    const message = `Duplicate field value: ${value}. Please use another value.`;
    return new AppError(message, HTTP_CODES.BAD_REQUEST);
};

/**
 * Handle validation error from database
 */
const handleValidationError = (err) => {
    const errors = Object.values(err.errors || {}).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, HTTP_CODES.BAD_REQUEST);
};

/**
 * Handle JWT error
 */
const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again.', HTTP_CODES.UNAUTHORIZED);
};

/**
 * Handle JWT expired error
 */
const handleJWTExpiredError = () => {
    return new AppError('Your token has expired. Please log in again.', HTTP_CODES.UNAUTHORIZED);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming or unknown error: don't leak error details
        logger.error('ERROR 💥', err);
        res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, _next) => {
    err.statusCode = err.statusCode || HTTP_CODES.INTERNAL_SERVER_ERROR;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err, message: err.message };

        if (err.name === 'CastError') error = handleCastError(err);
        if (err.code === 11000) error = handleDuplicateFieldsError(err);
        if (err.name === 'ValidationError') error = handleValidationError(err);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

module.exports = { errorHandler };
