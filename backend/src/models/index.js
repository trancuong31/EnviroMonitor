const User = require('./User');
const DataInfo = require('./DataInfo');
const Sensor = require('./Sensor');
const THSpec = require('./THSpec');
const THSpecHistory = require('./THSpecHistory');
DataInfo.belongsTo(Sensor, {
    foreignKey: 'sensorId',
    targetKey: 'sensorId',
    as: 'sensor'
});

Sensor.hasMany(DataInfo, {
    foreignKey: 'sensorId',
    sourceKey: 'sensorId',
});

Sensor.belongsTo(THSpec, {
    foreignKey: 'locationId',
    targetKey: 'location',
    as: 'spec'
});

THSpec.hasMany(Sensor, {
    foreignKey: 'locationId',
    sourceKey: 'location',
    as: 'sensors'
});
module.exports = {
    User,
    DataInfo,
    Sensor,
    THSpec,
    THSpecHistory,
};
