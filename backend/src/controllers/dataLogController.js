const dataLogs = require('../services/dataLogService');
const { catchAsync } = require('../utils/catchAsync');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * get all logs
 */
const getLogs = catchAsync(async (req, res) => {
    const logs = await dataLogs.getLogs();

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { logs },
    });
});
module.exports = {
    getLogs,
};
