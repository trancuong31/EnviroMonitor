const userService = require('../services/userService');
const { catchAsync } = require('../utils/catchAsync');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Update current user's threshold settings
 */
const updateSettings = catchAsync(async (req, res) => {

    const settings = await userService.updateSettings(req.body);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { settings },
    });
});

/**
 * Create new user
 */
const createUser = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);

    res.status(HTTP_CODES.CREATED).json({
        status: 'success',
        data: { user },
    });
});


/**
 * Update user
 */
const updateUser = catchAsync(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { user },
    });
});
/**
 * Delete user
 */
const deleteUser = catchAsync(async (req, res) => {
    const user = await userService.deleteUser(req.params.id);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { user },
    });
});

/**
 * Get all users
 */
const getAllUsers = catchAsync(async (req, res) => {
    const users = await userService.getAllUsers();

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { users },
    });
});

/**
 * Get all departments
 */
const getAllDepartment = catchAsync(async (req, res) => {
    const departments = await userService.getAllDepartment();

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { departments },
    });
});
module.exports = {
    updateSettings,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getAllDepartment,
};
