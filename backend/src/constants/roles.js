/**
 * User roles
 */
const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    MANAGER: 'manager',
};

/**
 * Check if a role is valid
 */
const isValidRole = (role) => Object.values(ROLES).includes(role);

module.exports = { ROLES, isValidRole };
