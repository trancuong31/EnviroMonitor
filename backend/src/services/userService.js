const { User } = require('../models');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const bcrypt = require('bcryptjs');

/**
 * Allowed threshold fields for update
 */
const THRESHOLD_FIELDS = [
    'fridgeTempMin', 'fridgeTempMax',
    'fridgeHumMin', 'fridgeHumMax',
    'roomTempMin', 'roomTempMax',
    'roomHumMin', 'roomHumMax',
    'ng'
];

/**
 * Admin update threshold settings for ALL users
 * @param {object} settingsData - threshold values to update
 * @returns {Promise<object>}
 */
const updateSettings = async (settingsData) => {
    // 1. Lọc và parse các trường được phép cập nhật
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

    // 2. Validate các cặp min < max
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

    // 3. Cập nhật cho TẤT CẢ user theo setting
    await User.update(updateData, { where: {} });

    return updateData;
};

// create user
const createUser = async (userData, userId) => {
    // validate user data
    const { name, email, password, factory, emailAlertEnabled } = userData;
    if (!name || !email || !password || !factory) {
        throw new AppError('Missing required fields', HTTP_CODES.BAD_REQUEST);
    }

    // check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new AppError('User already exists', HTTP_CODES.BAD_REQUEST);
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        factory,
        emailAlertEnabled: emailAlertEnabled,
        created_by: userId,
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
    const { name, email, password, role, factory, status, emailAlertEnabled } = userData;
    if (!name || !email || !role || !factory) {
        throw new AppError('Missing required fields', HTTP_CODES.BAD_REQUEST);
    }
    
    // check if user exists (only if email changed)
    if (email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new AppError('User with this email already exists', HTTP_CODES.BAD_REQUEST);
        }
    }

    const updatePayload = {
        name,
        email,
        role,
        factory,
        status,
        emailAlertEnabled: emailAlertEnabled,
        updated_by
    };

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
        order: [['createdAt', 'DESC']]
    });
};

module.exports = {
    updateSettings,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers
};
