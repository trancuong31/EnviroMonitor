/**
 * Email alert statuses
 */
const EMAIL_ALERTS = {
    YES: 'yes',
    NO: 'no',
};

/**
 * Check if an email alert status is valid
 */
const isValidEmailAlert = (status) => Object.values(EMAIL_ALERTS).includes(status);

module.exports = { EMAIL_ALERTS, isValidEmailAlert };