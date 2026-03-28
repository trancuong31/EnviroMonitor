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
    const { sensorId, startDate, endDate } = req.query;
    const logs = await dataLogs.getLogsByDateRange(sensorId, startDate, endDate);

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { logs },
    });
});

/**
 * get list sensors from SENSOR table
 */
const getListSensors = catchAsync(async (req, res) => {
    const sensors = await dataLogs.getListSensors();

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { sensors },
    });
});

/**
 * Get sensors by prefix (for layout hotspots)
 */
const getSensorsByPrefix = catchAsync(async (req, res) => {
    const { prefix } = req.query;
    const sensors = await dataLogs.getSensorsByPrefix(prefix);

    if (!sensors || sensors.length === 0) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
            status: 'fail',
            message: 'No sensors found',
        });
    }

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { sensors },
    });
});

/**
 * Update per-sensor threshold settings
 */
const updateSensor = catchAsync(async (req, res) => {
    const { id } = req.params;
    const sensor = await dataLogs.updateSensor(id, req.body);

    if (!sensor) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
            status: 'fail',
            message: 'Sensor not found',
        });
    }

    res.status(HTTP_CODES.OK).json({
        status: 'success',
        data: { sensor },
    });
});

/**
 * Get layout detail with sensor hotspots
 */
const getLayoutDetail = catchAsync(async (req, res) => {
    const { position } = req.query;
    const layoutData = await dataLogs.getLayoutDetail(position);

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
    getListSensors,
    getSensorsByPrefix,
    updateSensor,
    getLayoutDetail,
};
