/**
 * Entity statuses
 */
const STATUSES = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
};

/**
 * Check if a status is valid
 */
const isValidStatus = (status) => Object.values(STATUSES).includes(status);

module.exports = { STATUSES, isValidStatus };
