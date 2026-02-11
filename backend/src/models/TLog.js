const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TLog = sequelize.define('TLog', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    logidx: {
        type: DataTypes.STRING(14),
        allowNull: false,
    },
    tc_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    log_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    value_0: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    value_1: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    event_time: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'tlog',
    timestamps: false,
});

module.exports = TLog;
