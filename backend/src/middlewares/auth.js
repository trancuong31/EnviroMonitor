const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { HTTP_CODES } = require('../constants/httpCodes');
const env = require('../config/env');

/**
 * Authentication middleware - verifies JWT token
 */
const authenticate = catchAsync(async (req, res, next) => {
    // Get token from header
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in. Please log in to get access.', HTTP_CODES.UNAUTHORIZED));
    }

    // Verify token
    const decoded = jwt.verify(token, env.jwt.secret);

    // Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
        return next(new AppError('The user belonging to this token no longer exists.', HTTP_CODES.UNAUTHORIZED));
    }

    // Check if user changed password after token was issued
    if (user.passwordChangedAt) {
        const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
        if (decoded.iat < changedTimestamp) {
            return next(new AppError('User recently changed password. Please log in again.', HTTP_CODES.UNAUTHORIZED));
        }
    }

    // Grant access
    req.user = user;
    next();
});

/**
 * Authorization middleware - restricts access to specific roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', HTTP_CODES.FORBIDDEN));
        }
        next();
    };
};

module.exports = {
    authenticate,
    authorize,
};
