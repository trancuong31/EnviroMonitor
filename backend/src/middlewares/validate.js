const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Validation middleware - validates request using Joi schema
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                status: 'fail',
                message: errorMessage,
            });
        }

        next();
    };
};

module.exports = { validate };
