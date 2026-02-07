const logger = require('../config/logger');

/**
 * Email Queue Job
 * Uses a simple in-memory queue for development
 * Replace with Bull/Redis for production
 */
class EmailQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    /**
     * Add email job to queue
     */
    add(emailData) {
        this.queue.push({
            id: Date.now(),
            data: emailData,
            createdAt: new Date(),
        });

        logger.info(`Email job added to queue: ${emailData.subject}`);
        this.process();
    }

    /**
     * Process email queue
     */
    async process() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0) {
            const job = this.queue.shift();

            try {
                // Import email utility
                const { sendEmail } = require('../utils/email');
                await sendEmail(job.data);
                logger.info(`Email job ${job.id} completed`);
            } catch (error) {
                logger.error(`Email job ${job.id} failed:`, error);
                // Re-queue failed jobs (with retry limit in production)
            }
        }

        this.processing = false;
    }
}

const emailQueue = new EmailQueue();

module.exports = { emailQueue };
