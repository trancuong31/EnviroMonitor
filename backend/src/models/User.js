const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { ROLES } = require('../constants/roles');
const { STATUSES } = require('../constants/statuses');
const { FACTORIES } = require('../constants/factories');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM(...Object.values(ROLES)),
        defaultValue: ROLES.USER,
    },
    status: {
        type: DataTypes.ENUM(...Object.values(STATUSES)),
        defaultValue: STATUSES.ACTIVE,
    },
    factory: {
        type: DataTypes.ENUM(...Object.values(FACTORIES)),
        allowNull: true,
        defaultValue: null,
    },
    fridgeTempMin: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 2,
    },
    fridgeTempMax: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 10,
    },
    fridgeHumMin: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 50,
    },
    fridgeHumMax: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 100,
    },
    roomTempMin: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 18,
    },
    roomTempMax: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 28,
    },
    roomHumMin: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 40,
    },
    roomHumMax: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 60,
    },
    ng: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 15,
    },
    avatar: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    lastAlertSentAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
});

module.exports = User;
