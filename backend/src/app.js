const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler, apiLimiter } = require('./middlewares');
const { AppError } = require('./utils/appError');
const { HTTP_CODES } = require('./constants/httpCodes');

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());

// Rate limiting
app.use('/api', apiLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/v1', routes);

// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, HTTP_CODES.NOT_FOUND));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
