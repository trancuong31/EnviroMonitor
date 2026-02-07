/**
 * User roles
 */
const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
};

/**
 * Check if a role is valid
 */
const isValidRole = (role) => Object.values(ROLES).includes(role);

module.exports = { ROLES, isValidRole };
