const User = require('./User');
const DataInfo = require('./DataInfo');
const Sensor = require('./Sensor');
DataInfo.belongsTo(Sensor, {
    foreignKey: 'sensorId',
    targetKey: 'sensorId',
    as: 'sensor'
});

Sensor.hasMany(DataInfo, {
    foreignKey: 'sensorId',
    sourceKey: 'sensorId',
});
module.exports = {
    User,
    DataInfo,
    Sensor,
};
