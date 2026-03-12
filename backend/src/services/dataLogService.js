const { TLog, Layout, Type } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const getLogs = async ({ factory } = {}) => {
    const whereConditions = {
        log_date: {
            [Op.eq]: sequelize.literal(`(
                SELECT MAX(t2.log_date)
                FROM tlog t2
                WHERE t2.logidx = TLog.logidx
            )`)
        }
    };

    // Filter by factory prefix (first 2 chars of tc_name, e.g. V4, V5)
    if (factory) {
        whereConditions.tc_name = { [Op.like]: `${factory}%` };
    }

    const logs = await TLog.findAll({
        attributes: {
            include: [
                // Attach sensorType (FRIDGE/ROOM) from TYPE table based on tc_name mapping
                [
                    sequelize.literal(`(
                        SELECT TT.\`TYPE\`
                        FROM \`TYPE\` TT
                        WHERE TT.\`TC_NAME\` = TLog.tc_name
                        LIMIT 1
                    )`),
                    'sensorType',
                ],
            ],
        },
        where: whereConditions,
        order: [['tc_name', 'ASC']],
        limit: 20
    });

    return logs;
};

const getLogsByDateRange = async (logidx, startDate, endDate) => {
    const logs = await TLog.findAll({
        where: {
            log_date: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            },
            logidx: logidx
        },
        order: [['log_date', 'ASC']],
    });

    return logs;
};

const getListLayout = async () => {
    const layouts = await Layout.findAll();
    return layouts;
};

const getListImages = async () => {
    const images = await Type.findAll();
    return images;
};

/**
 * Get layout detail with associated sensors by position prefix
 * Sensors belong to a layout when TC_NAME starts with the layout's POSITION
 */
const getLayoutWithSensors = async (position) => {
    const layout = await Layout.findOne({ where: { position } });

    if (!layout) return null;

    const sensors = await Type.findAll({
        where: { tcName: { [Op.like]: `${position}%` } },
        attributes: ['id', 'tcName', 'images', 'xPercent', 'yPercent'],
        order: [['tcName', 'ASC']],
    });

    return {
        layoutImage: layout.images,
        sensors: sensors.map((s) => ({
            id: s.id,
            name: s.tcName,
            image: s.images,
            x: s.xPercent,
            y: s.yPercent,
        })),
    };
};

module.exports = {
    getLogs,
    getLogsByDateRange,
    getListLayout,
    getListImages,
    getLayoutWithSensors,
};