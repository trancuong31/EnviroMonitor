const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Update user settings
router.put('/settings', userController.updateSettings);

// Create user
router.post('/', userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Get all users
router.get('/', userController.getAllUsers);

// Get all departments
router.get('/departments', userController.getAllDepartment);

module.exports = router;
