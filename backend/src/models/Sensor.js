const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sensor = sequelize.define('Sensor', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        field: 'ID',
    },
    sensorId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        field: 'SENSORID',
    },
    type: {
        type: DataTypes.ENUM('C', 'N'),
        allowNull: true,
        defaultValue: 'N',
        field: 'TYPE',
    },
    ng: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'NG',
        defaultValue: 15.0,
    },
    position: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'POSITION',
    },
    images: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'IMAGES',
    },
    xPosition: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'XPOSITION',
    },
    yPosition: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'YPOSITION',
    },
    temperatureMin: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'TEMPERATUREMIN',
    },
    temperatureMax: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'TEMPERATUREMAX',
    },
    humidityMin: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'HUMIDITYMIN',
    },
    humidityMax: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'HUMIDITYMAX',
    },
}, {
    tableName: 'sensor_info',
    timestamps: false,
    underscored: false,
});

module.exports = Sensor;

