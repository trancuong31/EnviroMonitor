const dataLogs = require('../services/dataLogService');
const { catchAsync } = require('../utils/catchAsync');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * get all logs
 */
const getLogs = catchAsync(async (req, res) => {
    const { factory } = req.query;
    const logs = await dataLogs.getLogs({ factory });

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { logs },
    });
});

/**
 * get logs by date range
 */
const getLogsByDateRange = catchAsync(async (req, res) => {
    const { logidx, startDate, endDate } = req.query;
    const logs = await dataLogs.getLogsByDateRange(logidx, startDate, endDate);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { logs },
    });
});

module.exports = {
    getLogs,
    getLogsByDateRange,
};
