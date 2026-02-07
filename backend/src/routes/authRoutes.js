const express = require('express');
const { authController } = require('../controllers');
const { validate, authenticate, authLimiter } = require('../middlewares');
const { authValidation } = require('../validations');

const router = express.Router();

// Public routes
router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', authLimiter, validate(authValidation.login), authController.login);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
