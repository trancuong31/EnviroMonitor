const express = require('express');
const authRoutes = require('./authRoutes');
const dataLogRoutes = require('./dataLogRoutes');
const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/dataLogs', dataLogRoutes);
// Health check
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
