const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        field: 'ID',
    },
    departmentID: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'DEPARTMENTID',
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
    }
}, {
    tableName: 'department',
    timestamps: false,
    underscored: false,
});

module.exports = Department;

