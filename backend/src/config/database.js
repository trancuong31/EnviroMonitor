const { Sequelize } = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: (msg) => logger.debug(msg),
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: true,
            underscored: true,
        },
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info('MariaDB connection established successfully.');

        // Sync models - chỉ sync nếu cần, không alter vì bảng đã tồn tại
        if (process.env.NODE_ENV === 'development') {
            // Nếu muốn tự động tạo bảng mới, dùng sync() không có alter
            // await sequelize.sync();
            logger.info('Database connected. Tables should already exist.');
        }
    } catch (error) {
        logger.error('Unable to connect to MariaDB:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
