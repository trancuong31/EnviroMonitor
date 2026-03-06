const cron = require('node-cron');
const env = require('../config/env');
const logger = require('../config/logger');
const { getLogs } = require('../services/dataLogService');
const { sendEmail } = require('../utils/email');
const { buildAlertEmail } = require('../utils/alertEmailTemplate');
const { User } = require('../models');

const COOLDOWN_FALLBACK_MINUTES = 60;

/**
 * Check if enough time has passed since last alert for this user
 */
const canSendToUser = (user, now, cooldownMs) => {
    const lastSentAt = user?.lastAlertSentAt ? new Date(user.lastAlertSentAt) : null;
    if (!lastSentAt || Number.isNaN(lastSentAt.getTime())) return true;
    return now.getTime() - lastSentAt.getTime() >= cooldownMs;
};

const getThresholdsForSensor = (user, sensorType) => {
    if (sensorType === 'FRIDGE') {
        return {
            tempMin: user.fridgeTempMin,
            tempMax: user.fridgeTempMax,
            humMin: user.fridgeHumMin,
            humMax: user.fridgeHumMax,
        };
    }

    // Default to ROOM thresholds
    return {
        tempMin: user.roomTempMin,
        tempMax: user.roomTempMax,
        humMin: user.roomHumMin,
        humMax: user.roomHumMax,
    };
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
 *  3. Filter logs by user.factory (tc_name prefix)
 *  4. Compare against user-specific thresholds (fridge/room from DB)
 *  5. Build & send personalized email per user
 */
const checkAndAlert = async () => {
    try {
        const { alert } = env;
        const now = new Date();

        if (!alert.enabled) {
            logger.info('[AlertScheduler] Alert system is disabled, skipping check');
            return;
        }

        const cooldownMinutes = Number.isFinite(alert.cooldownMinutes) ? alert.cooldownMinutes : COOLDOWN_FALLBACK_MINUTES;
        const cooldownMs = Math.max(cooldownMinutes, 0) * 60 * 1000;

        // 1. Fetch all active users with factory assigned
        const userWhere = { status: 'active' };

        const recipients = await User.findAll({ where: userWhere });

        if (!recipients.length) {
            logger.warn('[AlertScheduler] No alert recipients found, skipping');
            return;
        }

        // 2. Fetch all sensor logs once (avoid repeated DB calls)
        const allLogs = await getLogs();

        if (!allLogs || allLogs.length === 0) {
            logger.info('[AlertScheduler] No sensor data found, skipping');
            return;
        }

        logger.info(`[AlertScheduler] Starting personalized check — ${recipients.length} users, ${allLogs.length} sensors`);

        let totalEmailsSent = 0;
        let totalSkipped = 0;

        // 3. Outer loop: iterate each user
        for (const user of recipients) {
            try {
                // Skip users without factory configured
                if (!user.factory) {
                    logger.debug(`[AlertScheduler] User ${user.email} has no factory assigned, skipping`);
                    totalSkipped++;
                    continue;
                }

                // Skip users in cooldown
                if (!canSendToUser(user, now, cooldownMs)) {
                    logger.debug(`[AlertScheduler] User ${user.email} is in cooldown, skipping`);
                    totalSkipped++;
                    continue;
                }

                // 4. Filter logs matching this user's factory (tc_name starts with factory code)
                const userLogs = allLogs.filter(log =>
                    log.tc_name && log.tc_name.startsWith(user.factory)
                );

                if (userLogs.length === 0) {
                    logger.debug(`[AlertScheduler] No sensors found for factory ${user.factory} (user: ${user.email})`);
                    continue;
                }

                // 5. Compare each log against user-specific thresholds
                const userAlerts = [];

                for (const log of userLogs) {
                    const temp = log.value_0;
                    const hum = log.value_1;
                    const sensorType = log.getDataValue('sensorType') || 'ROOM';

                    const thresholds = getThresholdsForSensor(user, sensorType);

                    const tempStatus = getStatus(temp, thresholds.tempMin, thresholds.tempMax);
                    const humStatus = getStatus(hum, thresholds.humMin, thresholds.humMax);

                    if (tempStatus !== 'normal' || humStatus !== 'normal') {
                        userAlerts.push({
                            logidx: log.logidx,
                            tc_name: log.tc_name,
                            value_0: temp,
                            value_1: hum,
                            log_date: log.log_date,
                            sensorType,
                            tempStatus,
                            humStatus,
                        });
                    }
                }

                // No alerts for this user → skip
                if (userAlerts.length === 0) {
                    logger.debug(`[AlertScheduler] Factory ${user.factory} — all sensors OK for ${user.email}`);
                    continue;
                }

                // 6. Build personalized email for this user
                const userThresholds = {
                    fridgeTempMin: user.fridgeTempMin,
                    fridgeTempMax: user.fridgeTempMax,
                    fridgeHumMin: user.fridgeHumMin,
                    fridgeHumMax: user.fridgeHumMax,
                    roomTempMin: user.roomTempMin,
                    roomTempMax: user.roomTempMax,
                    roomHumMin: user.roomHumMin,
                    roomHumMax: user.roomHumMax,
                };

                const { subject, html } = buildAlertEmail(userAlerts, userThresholds, user.name, user.factory);

                // 7. Send email
                await sendEmail({ email: user.email, subject, html });
                await user.update({ lastAlertSentAt: now });

                totalEmailsSent++;
                logger.warn(`[AlertScheduler] ⚠️ Alert sent to ${user.email} — factory: ${user.factory}, ${userAlerts.length} sensors exceeded thresholds`);

            } catch (err) {
                logger.error(`[AlertScheduler] Failed to process user ${user.email}:`, err.message);
            }
        }

        logger.info(`[AlertScheduler] Alert cycle completed — ${totalEmailsSent} emails sent, ${totalSkipped} users skipped`);

    } catch (error) {
        logger.error('[AlertScheduler] Error during check:', error.message);
    }
};

/**
 * Start the alert scheduler cron job — runs every hour
 */
const startAlertScheduler = () => {
    const { alert } = env;

    if (!alert.enabled) {
        logger.info('[AlertScheduler] Alert system is disabled in .env');
        return;
    }

    // Run every minute
    const cronExpression = '* * * * *';

    cron.schedule(cronExpression, () => {
        logger.info('[AlertScheduler] Scheduled check triggered');
        checkAndAlert();
    });

    logger.info(`[AlertScheduler] Started — checking every minute (cron: ${cronExpression})`);
    logger.info(`[AlertScheduler] Cooldown: ${alert.cooldownMinutes || COOLDOWN_FALLBACK_MINUTES} minutes`);

    // Run initial check on startup
    checkAndAlert();
};

module.exports = { startAlertScheduler, checkAndAlert };
