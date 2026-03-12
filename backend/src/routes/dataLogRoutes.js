const express = require('express');
const { dataLogController } = require('../controllers');

const router = express.Router();

// Public routes
router.get('/getLogs', dataLogController.getLogs);
router.get('/getLogsByDateRange', dataLogController.getLogsByDateRange);
router.get('/getListLayout', dataLogController.getListLayout);
router.get('/getListImages', dataLogController.getListImages);
router.get('/getLayoutDetail', dataLogController.getLayoutDetail);
module.exports = router;
