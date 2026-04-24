const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { ROLES } = require('../constants/roles');
const { STATUSES } = require('../constants/statuses');
const { FACTORIES } = require('../constants/factories');
const { EMAIL_ALERTS } = require('../constants/emailAlerts');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },    
    userid: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    fullname: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
        allowNull: false,
        defaultValue: FACTORIES.ALL,
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    emailAlert: {
        type: DataTypes.ENUM(...Object.values(EMAIL_ALERTS)),
        allowNull: false,
        defaultValue: EMAIL_ALERTS.NO,
    },
    lastAlertSentAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    eventuser: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: null,
    },
    eventtime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'user',
    timestamps: false,
    underscored: false,
});

module.exports = User;
