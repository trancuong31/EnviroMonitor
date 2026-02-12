const { TLog } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const getLogs = async () => {
    const logs = await TLog.findAll({
        where: {
            log_date: {
                [Op.eq]: sequelize.literal(`(
                    SELECT MAX(t2.log_date)
                    FROM tlog t2
                    WHERE t2.logidx = TLog.logidx
                )`)
            }
        },
        order: [['tc_name', 'ASC']],
        limit: 5
    });

    return logs;
};

const getLogsByDateRange= async (logidx, startDate, endDate) => {
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