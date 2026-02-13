const cron = require('node-cron');
const env = require('../config/env');
const logger = require('../config/logger');
const { getLogs } = require('../services/dataLogService');
const { sendEmail } = require('../utils/email');
const { buildAlertEmail } = require('../utils/alertEmailTemplate');

/**
 * Check environment data and send alert emails if thresholds are exceeded
 */
const checkAndAlert = async () => {
    try {
        const { alert } = env;

        if (!alert.enabled) {
            logger.info('[AlertScheduler] Alert system is disabled, skipping check');
            return;
        }

        if (!alert.emails.length) {
            logger.warn('[AlertScheduler] No alert emails configured, skipping');
            return;
        }

        logger.info('[AlertScheduler] Starting environment check...');

        // Get latest data for all locations
        const logs = await getLogs();

        if (!logs || logs.length === 0) {
            logger.info('[AlertScheduler] No sensor data found, skipping');
            return;
        }

        // Check each location against thresholds
        const alerts = [];

        for (const log of logs) {
            const temp = log.value_0;
            const hum = log.value_1;

            // Determine temperature status
            let tempStatus = 'normal';
            if (temp != null) {
                if (temp > alert.tempMax) tempStatus = 'high';
                else if (temp < alert.tempMin) tempStatus = 'low';
            }

            // Determine humidity status
            let humStatus = 'normal';
            if (hum != null) {
                if (hum > alert.humMax) humStatus = 'high';
                else if (hum < alert.humMin) humStatus = 'low';
            }

            // If either exceeds threshold, add to alerts
            if (tempStatus !== 'normal' || humStatus !== 'normal') {
                alerts.push({
                    logidx: log.logidx,
                    tc_name: log.tc_name,
                    value_0: temp,
                    value_1: hum,
                    log_date: log.log_date,
                    tempStatus,
                    humStatus,
                });
            }
        }

        if (alerts.length === 0) {
            logger.info('[AlertScheduler] All locations within safe thresholds ✅');
            return;
        }

        // Build email content
        const thresholds = {
            tempMin: alert.tempMin,
            tempMax: alert.tempMax,
            humMin: alert.humMin,
            humMax: alert.humMax,
        };

        const { subject, html } = buildAlertEmail(alerts, thresholds);

        // Send to all configured emails
        logger.warn(`[AlertScheduler] ⚠️ ${alerts.length} locations exceeding thresholds, sending alerts...`);

        for (const email of alert.emails) {
            try {
                await sendEmail({ email, subject, html });
                logger.info(`[AlertScheduler] Alert email sent to ${email}`);
            } catch (err) {
                logger.error(`[AlertScheduler] Failed to send alert to ${email}:`, err.message);
            }
        }

        logger.info(`[AlertScheduler] Alert cycle completed — ${alerts.length} alerts sent`);

    } catch (error) {
        logger.error('[AlertScheduler] Error during check:', error.message);
    }
};

/**
 * Start the alert scheduler cron job
 */
const startAlertScheduler = () => {
    const { alert } = env;

    if (!alert.enabled) {
        logger.info('[AlertScheduler] Alert system is disabled in .env');
        return;
    }

    // Cron expression: run at minute 0 of every hour → "0 * * * *"
    // For custom intervals, we still use the standard hourly cron
    const cronExpression = '0 * * * *';

    cron.schedule(cronExpression, () => {
        logger.info('[AlertScheduler] ⏰ Scheduled check triggered');
        checkAndAlert();
    });

    logger.info(`[AlertScheduler] 🚀 Started — checking every hour (cron: ${cronExpression})`);
    logger.info(`[AlertScheduler] 📧 Alert recipients: ${alert.emails.join(', ')}`);
    logger.info(`[AlertScheduler] 🌡️ Temp: ${alert.tempMin}–${alert.tempMax}°C | 💧 Hum: ${alert.humMin}–${alert.humMax}%`);

    // Run initial check on startup
    checkAndAlert();
};

module.exports = { startAlertScheduler, checkAndAlert };
