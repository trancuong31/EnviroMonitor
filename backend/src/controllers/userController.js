const userService = require('../services/userService');
const { catchAsync } = require('../utils/catchAsync');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Update current user's threshold settings
 */
const updateSettings = catchAsync(async (req, res) => {
    const user = await userService.updateSettings(req.user.id, req.body);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { user },
    });
});


module.exports = {
    updateSettings,
};
