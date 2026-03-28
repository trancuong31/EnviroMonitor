const { DataInfo, Sensor } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const getLogs = async ({ factory } = {}) => {
    const whereConditions = {
        date: {
            [Op.eq]: sequelize.literal(`(
                SELECT MAX(t2.\`DATE\`)
                FROM data_info t2
                WHERE t2.\`SENSORID\` = DataInfo.\`SENSORID\`
            )`)
        }
    };

    // Filter by factory prefix (first 2 chars of sensorId, e.g. V4, V5)
    if (factory) {
        whereConditions.sensorId = { [Op.like]: `${factory}%` };
    }

    const logs = await DataInfo.findAll({
        attributes: {
            include: [
                // Attach sensorType (FRIDGE/ROOM) from SENSOR table
                [
                    sequelize.literal(`(
                        SELECT S.\`TYPE\`
                        FROM \`sensor_info\` S
                        WHERE S.\`SENSORID\` = DataInfo.sensorId
                        LIMIT 1
                    )`),
                    'sensorType',
                ],
                // Attach per-sensor thresholds from SENSOR table
                [
                    sequelize.literal(`(
                        SELECT S.\`TEMPERATUREMIN\`
                        FROM \`sensor_info\` S
                        WHERE S.\`SENSORID\` = DataInfo.sensorId
                        LIMIT 1
                    )`),
                    'temperatureMin',
                ],
                [
                    sequelize.literal(`(
                        SELECT S.\`TEMPERATUREMAX\`
                        FROM \`sensor_info\` S
                        WHERE S.\`SENSORID\` = DataInfo.sensorId
                        LIMIT 1
                    )`),
                    'temperatureMax',
                ],
                [
                    sequelize.literal(`(
                        SELECT S.\`HUMIDITYMIN\`
                        FROM \`sensor_info\` S
                        WHERE S.\`SENSORID\` = DataInfo.sensorId
                        LIMIT 1
                    )`),
                    'humidityMin',
                ],
                [
                    sequelize.literal(`(
                        SELECT S.\`HUMIDITYMAX\`
                        FROM \`sensor_info\` S
                        WHERE S.\`SENSORID\` = DataInfo.sensorId
                        LIMIT 1
                    )`),
                    'humidityMax',
                ],
            ],
        },
        where: whereConditions,
        order: [['sensorId', 'ASC']],
        limit: 40
    });

    return logs;
};

const getLogsByDateRange = async (sensorId, startDate, endDate) => {
    const logs = await DataInfo.findAll({
        where: {
            date: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            },
            sensorId: sensorId
        },
        order: [['date', 'ASC']],
    });

    return logs;
};

const getListSensors = async () => {
    const sensors = await Sensor.findAll();
    return sensors;
};

/**
 * Get sensor detail with position info by sensorId prefix
 */
const getSensorsByPrefix = async (prefix) => {
    const sensors = await Sensor.findAll({
        where: { sensorId: { [Op.like]: `${prefix}%` } },
        attributes: ['id', 'sensorId', 'images', 'xPosition', 'yPosition'],
        order: [['sensorId', 'ASC']],
    });

    return sensors.map((s) => ({
        id: s.id,
        name: s.sensorId,
        image: s.images,
        x: s.xPosition,
        y: s.yPosition,
    }));
};

/**
 * Update per-sensor threshold settings
 */
const updateSensor = async (sensorId, data) => {
    const sensor = await Sensor.findOne({ where: { sensorId: sensorId } });
    if (!sensor) return null;

    const allowedFields = ['temperatureMin', 'temperatureMax', 'humidityMin', 'humidityMax'];
    const updateData = {};
    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    }

    await sensor.update(updateData);
    return sensor;
};

const getLayoutDetail = async (position) => {
    const sensors = await Sensor.findAll({
        where: { position: position },
        attributes: ['id', 'sensorId', 'images', 'xPosition', 'yPosition'],
        order: [['sensorId', 'ASC']],
    });

    return sensors.map((s) => ({
        id: s.id,
        name: s.sensorId,
        image: s.images,
        x: s.xPosition,
        y: s.yPosition,
    }));
};

module.exports = {
    getLogs,
    getLogsByDateRange,
    getListSensors,
    getSensorsByPrefix,
    updateSensor,
    getLayoutDetail,
};