const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Translation = sequelize.define('Translation', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    description: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'DESCRIPTION',
    },
    vi: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'VI',
    },
    en: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'EN',
    },
    kr: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'KR',
    },
    eventTime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        field: 'EVENTTIME',
    },
    eventUser: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'EVENTUSER',
    }
}, {
    tableName: 'translations',
    timestamps: false,
    underscored: false,
});

module.exports = Translation;
