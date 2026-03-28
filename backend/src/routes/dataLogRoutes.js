const express = require('express');
const { dataLogController } = require('../controllers');

const router = express.Router();

// Public routes
router.get('/getLogs', dataLogController.getLogs);
router.get('/getLogsByDateRange', dataLogController.getLogsByDateRange);
router.get('/getListSensors', dataLogController.getListSensors);
router.get('/getSensorsByPrefix', dataLogController.getSensorsByPrefix);
router.put('/sensors/:id', dataLogController.updateSensor);
router.get('/getLayoutDetail', dataLogController.getLayoutDetail);

module.exports = router;
