const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const THSpecHistory = sequelize.define('THSpecHistory', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        field: 'ID',
    },
    location: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        field: 'LOCATION',
    },
    ng: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'NG',
        defaultValue: 15.0,
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
    tableName: 'th_spec_table_history',
    timestamps: false,
    underscored: false,
});

module.exports = THSpecHistory;