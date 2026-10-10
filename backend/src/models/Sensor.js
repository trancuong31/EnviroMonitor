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
    item: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'ITEM',
    },
    locationId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'LOCATIONID',
    },
    areaId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AREAID',
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
    humidityMax: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'HUMIDITYMAX',
    },
    humidityMin: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'HUMIDITYMIN',
    },
    temperatureMax: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'TEMPERATUREMAX',
    },
    temperatureMin: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'TEMPERATUREMIN',
    }
}, {
    tableName: 'sensor',
    timestamps: false,
    underscored: false,
});

module.exports = Sensor;

