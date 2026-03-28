const cron = require('node-cron');
const env = require('../config/env');
const logger = require('../config/logger');
const { getLogs } = require('../services/dataLogService');
const { sendEmail } = require('../utils/email');
const { buildAlertEmail } = require('../utils/alertEmailTemplate');
const { User } = require('../models');
const { EMAIL_ALERTS } = require('../constants/emailAlerts');
const { STATUSES } = require('../constants/statuses');
const { FACTORIES } = require('../constants/factories');
const COOLDOWN_FALLBACK_MINUTES = 60;

/**
 * Check if enough time has passed since last alert for this user
 */
const canSendToUser = (user, now, cooldownMs) => {
    const lastSentAt = user?.lastAlertSentAt ? new Date(user.lastAlertSentAt) : null;
    if (!lastSentAt || Number.isNaN(lastSentAt.getTime())) return true;
    return now.getTime() - lastSentAt.getTime() >= cooldownMs;
};

const getStatus = (value, min, max) => {
    if (value == null) return 'normal';
    if (max != null && value > max) return 'high';
    if (min != null && value < min) return 'low';
    return 'normal';
};

/**
 * Check environment data and send personalized alert emails per user.
 *
 * Flow:
 *  1. Fetch all logs once
 *  2. Loop through each active user (outer loop)
 *  3. Filter logs by user.factory (tc_name prefix) and EMAIL_ALERT_ENABLED = YES
 *  4. Compare against user-specific thresholds (fridge/room from DB)
 *  5. Build & send personalized email per user
 */
const checkAndAlert = async () => {
    try {
        const { alert } = env;
        const now = new Date();

        if (!alert.enabled) {
            logger.info('[AlertScheduler] Alert system is disabled.');
            return;
        }

        const cooldownMinutes = Number.isFinite(alert.cooldownMinutes) ? alert.cooldownMinutes : COOLDOWN_FALLBACK_MINUTES;
        const cooldownMs = Math.max(cooldownMinutes, 0) * 60 * 1000;

        // User model uses STATUSES.ACTIVE ('active'), not 'Active'
        const userWhere = { status: STATUSES.ACTIVE, emailAlert: EMAIL_ALERTS.YES };
        const recipients = await User.findAll({ where: userWhere });

        if (!recipients.length) return;

        // Lấy tất cả logs (Đã chứa min/max từ literal của bạn)
        const allLogs = await getLogs();
        if (!allLogs || allLogs.length === 0) return;

        let totalEmailsSent = 0;

        for (const user of recipients) {
            try {
                if (!user.factory) continue;
                if (!canSendToUser(user, now, cooldownMs)) continue;

                let userLogs = [];
                
                if (user.factory === FACTORIES.ALL) {
                    userLogs = allLogs;
                } else {
                    userLogs = allLogs.filter(log => 
                        log.sensorId && log.sensorId.startsWith(user.factory)
                    );
                }

                if (userLogs.length === 0) continue;

                const userAlerts = [];

                for (const log of userLogs) {
                    const temp = log.temperature;
                    const hum = log.humidity;

                    // Đọc từ getDataValue do bạn dùng literal
                    const tempMin = log.getDataValue('temperatureMin') ?? 18; 
                    const tempMax = log.getDataValue('temperatureMax') ?? 28;
                    const humMin = log.getDataValue('humidityMin') ?? 40;
                    const humMax = log.getDataValue('humidityMax') ?? 60;
                    const typeCode = log.getDataValue('sensorType') || 'N';

                    const tempStatus = getStatus(temp, tempMin, tempMax);
                    const humStatus = getStatus(hum, humMin, humMax);

                    if (tempStatus !== 'normal' || humStatus !== 'normal') {
                        userAlerts.push({
                            sensorId: log.sensorId,
                            temperature: temp,
                            humidity: hum,
                            logDate: log.date,
                            sensorType: typeCode === 'C' ? 'Cold' : 'Normal',
                            tempStatus,
                            humStatus,
                            limits: { tempMin, tempMax, humMin, humMax }
                        });
                    }
                }

                if (userAlerts.length === 0) continue;

                const { subject, html } = buildAlertEmail(userAlerts, user.fullname, user.factory);

                // Login/email address is stored in `userid`, not `email`
                const toAddress = user.userid;
                if (!toAddress) {
                    logger.warn(`[AlertScheduler] Skip ${user.id}: missing userid (email)`);
                    continue;
                }

                await sendEmail({ email: toAddress, subject, html });
                await user.update({ lastAlertSentAt: now });
                totalEmailsSent++;
                
                logger.warn(`[AlertScheduler] Sent to ${user.userid} - Factory: ${user.factory} - ${userAlerts.length} issues.`);

            } catch (err) {
                logger.error(`[AlertScheduler] User ${user.userid} failed: ${err.message}`);
            }
        }

        logger.info(`[AlertScheduler] Complete - Sent: ${totalEmailsSent}`);

    } catch (error) {
        logger.error(`[AlertScheduler] Error: ${error.message}`);
    }
};

const startAlertScheduler = () => {
    const { alert } = env;

    if (!alert.enabled) {
        logger.info('[AlertScheduler] Alert system is disabled in .env');
        return;
    }

    const cronExpression = '* * * * *';

    cron.schedule(cronExpression, () => {
        logger.info('[AlertScheduler] Scheduled check triggered');
        checkAndAlert();
    });

    logger.info(`[AlertScheduler] Started — checking every hour (cron: ${cronExpression})`);
    logger.info(`[AlertScheduler] Cooldown: ${alert.cooldownMinutes || COOLDOWN_FALLBACK_MINUTES} hours`);

    checkAndAlert();
};

module.exports = { startAlertScheduler, checkAndAlert };
