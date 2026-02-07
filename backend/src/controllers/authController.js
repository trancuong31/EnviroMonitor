const authService = require('../services/authService');
const { catchAsync } = require('../utils/catchAsync');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Register a new user
 */
const register = catchAsync(async (req, res) => {
    const { user, token } = await authService.register(req.body);

    res.status(HTTP_CODES.CREATED).json({
        status: 'success',
        data: { user },
        token,
    });
});

/**
 * Login user
 */
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { user },
        token,
    });
});

/**
 * Get current user profile
 */
const getMe = catchAsync(async (req, res) => {
    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { user: req.user },
    });
});

/**
 * Logout user
 */
const logout = catchAsync(async (req, res) => {
    res.status(HTTP_CODES.OK).json({
        status: 'success',
        message: 'Logged out successfully',
    });
});

module.exports = {
    register,
    login,
    getMe,
    logout,
};
