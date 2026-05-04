const { User, Sensor, Department } = require('../models');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const bcrypt = require('bcryptjs');

const THRESHOLD_FIELDS = [
    'fridgeTempMin', 'fridgeTempMax',
    'fridgeHumMin', 'fridgeHumMax',
    'roomTempMin', 'roomTempMax',
    'roomHumMin', 'roomHumMax',
    'ng'
];

/**
 * Admin update threshold settings for Sensor_Info table
 * @param {object} settingsData - threshold values to update
 * @returns {Promise<object>}
 */
const updateSettings = async (settingsData) => {
    const updateData = {};
    for (const field of THRESHOLD_FIELDS) {
        if (settingsData[field] !== undefined) {
            const value = parseFloat(settingsData[field]);
            if (isNaN(value)) {
                throw new AppError(`Invalid value for ${field}`, HTTP_CODES.BAD_REQUEST);
            }
            updateData[field] = value;
        }
    }

    if (Object.keys(updateData).length === 0) {
        throw new AppError('No valid threshold fields provided', HTTP_CODES.BAD_REQUEST);
    }

    const pairs = [
        ['fridgeTempMin', 'fridgeTempMax'],
        ['fridgeHumMin', 'fridgeHumMax'],
        ['roomTempMin', 'roomTempMax'],
        ['roomHumMin', 'roomHumMax'],
    ];

    for (const [minField, maxField] of pairs) {
        const minVal = updateData[minField];
        const maxVal = updateData[maxField];
        
        if (minVal != null && maxVal != null && minVal >= maxVal) {
            throw new AppError(`${minField} must be less than ${maxField}`, HTTP_CODES.BAD_REQUEST);
        }
    }

    const fridgePayload = {};
    const roomPayload = {};

    if (updateData.fridgeTempMin !== undefined) fridgePayload.temperatureMin = updateData.fridgeTempMin;
    if (updateData.fridgeTempMax !== undefined) fridgePayload.temperatureMax = updateData.fridgeTempMax;
    if (updateData.fridgeHumMin !== undefined) fridgePayload.humidityMin = updateData.fridgeHumMin;
    if (updateData.fridgeHumMax !== undefined) fridgePayload.humidityMax = updateData.fridgeHumMax;
    
    if (updateData.roomTempMin !== undefined) roomPayload.temperatureMin = updateData.roomTempMin;
    if (updateData.roomTempMax !== undefined) roomPayload.temperatureMax = updateData.roomTempMax;
    if (updateData.roomHumMin !== undefined) roomPayload.humidityMin = updateData.roomHumMin;
    if (updateData.roomHumMax !== undefined) roomPayload.humidityMax = updateData.roomHumMax;

    if (updateData.ng !== undefined) {
        fridgePayload.ng = updateData.ng;
        roomPayload.ng = updateData.ng;
    }
    
    if (Object.keys(fridgePayload).length > 0) {
        await Sensor.update(fridgePayload, { 
            where: { type: 'C' } 
        });
    }

    if (Object.keys(roomPayload).length > 0) {
        await Sensor.update(roomPayload, { 
            where: { type: 'N' } 
        });
    }

    return updateData;
};

// create user
const createUser = async (userData, userId) => {
    // validate user data
    const { fullname, userid, password, factory, emailAlert, eventuser, department } = userData;
    if (!fullname || !userid || !password || !factory || !eventuser) {
        throw new AppError('Missing required fields', HTTP_CODES.BAD_REQUEST);
    }

    // check if user exists
    const existingUser = await User.findOne({ where: { userid: userid } });
    if (existingUser) {
        throw new AppError('User already exists', HTTP_CODES.BAD_REQUEST);
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // create user
    const user = await User.create({
        fullname: fullname,
        userid: userid,
        password: hashedPassword,
        factory,
        department: department || null,
        emailAlert: emailAlert,
        eventuser: eventuser,
    }); 

    return user;
};

//update user
const updateUser = async (userId, userData, updated_by) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new AppError('User not found', HTTP_CODES.NOT_FOUND);
    }
    // validate user data 
    // có thể null department, status, emailAlert
    const { fullname, userid, password, role, factory, department, status, emailAlert } = userData;
    if (!fullname || !userid || !role || !factory) {
        throw new AppError('Missing required fields', HTTP_CODES.BAD_REQUEST);
    }
    
    // check if user exists (only if email changed)
    if (userid !== user.userid) {
        const existingUser = await User.findOne({ where: { userid: userid } });
        if (existingUser) {
            throw new AppError('User with this email already exists', HTTP_CODES.BAD_REQUEST);
        }
    }
    const updatePayload = {
        fullname: fullname,
        userid: userid,
        role,
        factory,
        status,
        emailAlert: emailAlert,
        eventuser: updated_by
    };

    if (department !== undefined && department !== null) {
        updatePayload.department = department;
    }

    if (password) {
        updatePayload.password = await bcrypt.hash(password, 12);
    }

    // update user
    await user.update(updatePayload);

    return user;
};

//delete user
const deleteUser = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new AppError('User not found', HTTP_CODES.NOT_FOUND);
    }
    await user.destroy();
    return user;
};

//get all users
const getAllUsers = async () => {
    return await User.findAll({
        attributes: { exclude: ['password'] },
        order: [['eventtime', 'DESC']]
    });
};

//get all department
const getAllDepartment = async () => {
    return await Department.findAll({
        order: [['eventtime', 'DESC']]
    });
};

module.exports = {
    updateSettings,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getAllDepartment,
};
