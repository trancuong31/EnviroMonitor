const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Update threshold settings
router.put('/settings', userController.updateSettings);

module.exports = router;
