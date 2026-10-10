const { DataInfo, Sensor, THSpec, THSpecHistory } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const getLogs = async ({ factory } = {}) => {
    const whereConditions = {};
    let subQuery = 'SELECT SENSORID, MAX(DATE) FROM data';

    if (factory) {
        whereConditions.sensorId = { [Op.like]: `${factory}%` };
        // Tối ưu: Filter ngay từ lúc subquery để giảm kích thước bảng tạm
        subQuery += ` WHERE SENSORID LIKE '${factory}%'`;
    }

    subQuery += ' GROUP BY SENSORID';

    // Sử dụng Tuple IN thay vì Correlated Subquery
    whereConditions[Op.and] = [
        sequelize.literal(`(DataInfo.SENSORID, DataInfo.DATE) IN (${subQuery})`)
    ];

    const logs = await DataInfo.findAll({
        where: whereConditions,
        include: [
            {
                model: Sensor,
                as: 'sensor',
                attributes: ['type', 'locationId', 'humidityMax', 'humidityMin', 'temperatureMax', 'temperatureMin', 'areaId', 'item'],
                include: [
                    {
                        model: THSpec,
                        as: 'spec',
                        attributes: [
                            'ng', 'temperatureMin', 'temperatureMax',
                            'humidityMin', 'humidityMax'
                        ]
                    }
                ]
            }
        ],
        order: [
            [sequelize.literal(`CASE WHEN DataInfo.SENSORID LIKE 'V%' THEN 1 WHEN DataInfo.SENSORID LIKE 'D%' THEN 2 ELSE 3 END`), 'ASC'],
            ['sensorId', 'ASC']
        ],
        limit: 100,
        raw: true,
        nest: true
    });

    return logs.map(log => {
        const sensor = log.sensor || {};
        const spec = sensor.spec || {};

        let tMin = spec.temperatureMin ?? null;
        let tMax = spec.temperatureMax ?? null;
        let hMin = spec.humidityMin ?? null;
        let hMax = spec.humidityMax ?? null;

        if (sensor.locationId === 'PL') {
            tMin = sensor.temperatureMin ?? tMin;
            tMax = sensor.temperatureMax ?? tMax;
            hMin = sensor.humidityMin ?? hMin;
            hMax = sensor.humidityMax ?? hMax;
        }

        return {
            ...log,
            sensorType: sensor.type || null,
            NG: spec.ng || null,
            temperatureMin: tMin,
            temperatureMax: tMax,
            humidityMin: hMin,
            humidityMax: hMax,
            areaId: sensor.areaId || null,
            item: sensor.item || null,
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

    if (sensor.locationId !== 'PL') {
        throw new Error('Permission denied: Only sensors in location PL can be updated.');
    }

    const allowedFields = ['temperatureMin', 'temperatureMax', 'humidityMin', 'humidityMax'];
    const updateData = {};
    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    }

    await sensor.update(updateData);

    await THSpecHistory.create({
        location: sensor.locationId,
        sensorId: sensor.sensorId,
        ng: null,
        temperatureMin: updateData.temperatureMin !== undefined ? updateData.temperatureMin : sensor.temperatureMin,
        temperatureMax: updateData.temperatureMax !== undefined ? updateData.temperatureMax : sensor.temperatureMax,
        humidityMin: updateData.humidityMin !== undefined ? updateData.humidityMin : sensor.humidityMin,
        humidityMax: updateData.humidityMax !== undefined ? updateData.humidityMax : sensor.humidityMax,
        eventUser: data.eventUser || 'system',
    });

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

        // Update SENSOR table overriding any specific sensor thresholds for this location ONLY IF location is PL
        if (location === 'PL') {
            const sensorUpdateData = {};
            if (data.temperatureMin !== undefined) sensorUpdateData.temperatureMin = data.temperatureMin;
            if (data.temperatureMax !== undefined) sensorUpdateData.temperatureMax = data.temperatureMax;
            if (data.humidityMin !== undefined) sensorUpdateData.humidityMin = data.humidityMin;
            if (data.humidityMax !== undefined) sensorUpdateData.humidityMax = data.humidityMax;

            if (Object.keys(sensorUpdateData).length > 0) {
                await Sensor.update(sensorUpdateData, { where: { locationId: location } });
            }
        }

        // insert into th_spec_history
        await THSpecHistory.create({
            location: location,
            sensorId: 'ALL',
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
        throw error;
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