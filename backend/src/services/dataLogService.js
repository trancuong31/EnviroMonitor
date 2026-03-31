const { DataInfo, Sensor, THSpec, THSpecHistory } = require('../models');
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

    if (factory) {
        whereConditions.sensorId = { [Op.like]: `${factory}%` };
    }

    const logs = await DataInfo.findAll({
        where: whereConditions,
        include: [
            {
                model: Sensor,
                as: 'sensor',
                attributes: ['type'], 
                include: [
                    {
                        model: THSpec,
                        as: 'spec',
                        attributes: [
                            'ng', 
                            'temperatureMin', 
                            'temperatureMax', 
                            'humidityMin', 
                            'humidityMax'
                        ]
                    }
                ]
            }
        ],
        order: [['sensorId', 'ASC']],
        limit: 40,
        raw: true,
        nest: true
    });

    return logs.map(log => {
        return {
            ...log,
            sensorType: log.sensor?.type || null,
            NG: log.sensor?.spec?.ng || null,
            temperatureMin: log.sensor?.spec?.temperatureMin ?? null,
            temperatureMax: log.sensor?.spec?.temperatureMax ?? null,
            humidityMin: log.sensor?.spec?.humidityMin ?? null,
            humidityMax: log.sensor?.spec?.humidityMax ?? null,
            sensor: undefined
        };
    });
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

const getSettings = async () => {
    const settings = await THSpec.findAll();
    return settings;
};

const updateSettings = async (location, data) => {
    try {
        let spec = await THSpec.findOne({ where: { location } });
    
    const updateData = {};
    if (data.temperatureMin !== undefined) updateData.temperatureMin = data.temperatureMin;
    if (data.temperatureMax !== undefined) updateData.temperatureMax = data.temperatureMax;
    if (data.humidityMin !== undefined) updateData.humidityMin = data.humidityMin;
    if (data.humidityMax !== undefined) updateData.humidityMax = data.humidityMax;
    if (data.ng !== undefined) updateData.ng = data.ng;

    if (!spec) {
        const maxIdSpec = await THSpec.findOne({ order: [['id', 'DESC']] });
        const newId = maxIdSpec ? maxIdSpec.id + 1 : 1;
        spec = await THSpec.create({ id: newId, location, ...updateData });
    } else {
        await spec.update(updateData);
    }
    if (data.ng !== undefined) {
        await THSpec.update({ ng: data.ng }, { where: {} });
    }
    // insert into th_spec_history
    await THSpecHistory.create({
        location: location,
        ng: data.ng,
        temperatureMin: data.temperatureMin,
        temperatureMax: data.temperatureMax,
        humidityMin: data.humidityMin,
        humidityMax: data.humidityMax,
        eventUser: data.eventUser,
    });
    return spec;
    } catch (error) {
        console.log(error);
        return null;
    }
};

module.exports = {
    getLogs,
    getLogsByDateRange,
    getListSensors,
    getSensorsByPrefix,
    updateSensor,
    getLayoutDetail,
    getSettings,
    updateSettings,
};