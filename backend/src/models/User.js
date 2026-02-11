const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { ROLES } = require('../constants/roles');
const { STATUSES } = require('../constants/statuses');

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
    avatar: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
});

module.exports = User;
