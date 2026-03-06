const { User } = require('../models');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Allowed threshold fields for update
 */
const THRESHOLD_FIELDS = [
    'fridgeTempMin', 'fridgeTempMax',
    'fridgeHumMin', 'fridgeHumMax',
    'roomTempMin', 'roomTempMax',
    'roomHumMin', 'roomHumMax',
];

/**
 * Update user threshold settings
 * @param {number} userId
 * @param {object} settingsData - threshold values to update
 * @returns {Promise<User>}
 */
const updateSettings = async (userId, settingsData) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new AppError('User not found', HTTP_CODES.NOT_FOUND);
    }

    // Filter only allowed threshold fields
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

    // Validate min < max pairs
    const pairs = [
        ['fridgeTempMin', 'fridgeTempMax'],
        ['fridgeHumMin', 'fridgeHumMax'],
        ['roomTempMin', 'roomTempMax'],
        ['roomHumMin', 'roomHumMax'],
    ];

    for (const [minField, maxField] of pairs) {
        const minVal = updateData[minField] ?? user[minField];
        const maxVal = updateData[maxField] ?? user[maxField];
        if (minVal != null && maxVal != null && minVal >= maxVal) {
            throw new AppError(`${minField} must be less than ${maxField}`, HTTP_CODES.BAD_REQUEST);
        }
    }

    await user.update(updateData);

    // Exclude password from response
    const userData = user.toJSON();
    delete userData.password;

    return userData;
};

module.exports = {
    updateSettings,
};
