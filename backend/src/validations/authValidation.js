const Joi = require('joi');

const register = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 100 characters',
        'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).max(128).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must not exceed 128 characters',
        'any.required': 'Password is required',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password',
    }),
});

const login = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required',
    }),
});

const forgotPassword = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required',
    }),
});

const resetPassword = Joi.object({
    password: Joi.string().min(8).max(128).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must not exceed 128 characters',
        'any.required': 'Password is required',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password',
    }),
});

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
};
