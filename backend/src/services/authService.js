const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const env = require('../config/env');

/**
 * Register a new user
 */
const register = async (userData) => {
    const { email, password, name } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new AppError('Email already in use', HTTP_CODES.BAD_REQUEST);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
        email,
        password: hashedPassword,
        name,
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    user.password = undefined;

    return { user, token };
};

/**
 * Login user
 */
const login = async (email, password) => {
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new AppError('Invalid email or password', HTTP_CODES.UNAUTHORIZED);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError('Invalid email or password', HTTP_CODES.UNAUTHORIZED);
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    user.password = undefined;

    return { user, token };
};

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, env.jwt.secret, {
        expiresIn: env.jwt.expiresIn,
    });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
    return jwt.verify(token, env.jwt.secret);
};

module.exports = {
    register,
    login,
    generateToken,
    verifyToken,
};
