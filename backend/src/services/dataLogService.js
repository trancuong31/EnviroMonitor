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
        order: [['logidx', 'ASC']],
        limit: 5
    });

    return logs;
};

module.exports = {
    getLogs,
};