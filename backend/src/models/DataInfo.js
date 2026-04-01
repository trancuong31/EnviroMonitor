const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DataInfo = sequelize.define('DataInfo', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    sensorId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'SENSORID',
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'DATE',
    },
    temperature: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'TEMPERATURE',
    },
    humidity: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'HUMIDITY',
    },
    eventTime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        field: 'EVENTTIME',
    },
}, {
    tableName: 'data',
    timestamps: false,
    underscored: false,
});

module.exports = DataInfo;
