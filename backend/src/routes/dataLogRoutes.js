const express = require('express');
const { dataLogController } = require('../controllers');

const router = express.Router();

// Public routes
router.get('/getLogs', dataLogController.getLogs);
router.get('/getLogsByDateRange', dataLogController.getLogsByDateRange);
module.exports = router;
