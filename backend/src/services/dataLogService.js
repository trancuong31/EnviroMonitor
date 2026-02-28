const { TLog } = require('../models');
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

module.exports = {
    getLogs,
    getLogsByDateRange,
};