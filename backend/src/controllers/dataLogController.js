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

/**
 * get list layout
 */
const getListLayout = catchAsync(async (req, res) => {
    const layouts = await dataLogs.getListLayout();

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { layouts },
    });
});

/**
 * get list images for table Type
 */
const getListImages = catchAsync(async (req, res) => {
    const images = await dataLogs.getListImages();

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { images },
    });
});

/**
 * Get layout detail with sensor hotspots
 */
const getLayoutDetail = catchAsync(async (req, res) => {
    const { position } = req.query;
    const layoutData = await dataLogs.getLayoutWithSensors(position);

    if (!layoutData) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
            status: 'fail',
            message: 'Layout not found',
        });
    }

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: layoutData,
    });
});

module.exports = {
    getLogs,
    getLogsByDateRange,
    getListLayout,
    getListImages,
    getLayoutDetail,
};
