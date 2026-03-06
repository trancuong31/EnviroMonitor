const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * TYPE table: maps each tc_name to a sensor category (FRIDGE/ROOM)
 * DB columns: ID, TC_NAME, TYPE
 */
const Type = sequelize.define('Type', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        field: 'ID',
    },
    tcName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'TC_NAME',
    },
    type: {
        type: DataTypes.ENUM('FRIDGE', 'ROOM'),
        allowNull: true,
        defaultValue: 'ROOM',
        field: 'TYPE',
    },
}, {
    tableName: 'TYPE',
    timestamps: false,
    underscored: false,
});

module.exports = Type;

