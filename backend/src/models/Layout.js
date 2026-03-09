const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * LAYOUT table:
 * DB columns: ID, POSITION, IMAGES
 */
const Layout = sequelize.define('Layout', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        field: 'ID',
    },
    position: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'POSITION',
    },
    images: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'IMAGES',
    },
}, {
    tableName: 'LAYOUT',
    timestamps: false,
    underscored: false,
});

module.exports = Layout;

