const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

/**
 * Create email transporter
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: env.email.host,
        port: env.email.port,
        auth: {
            user: env.email.user,
            pass: env.email.pass,
        },
    });
};

/**
 * Send email
 */
const sendEmail = async (options) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `EnviroMonitor <${env.email.from}>`,
        to: options.email,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Email sent to ${options.email}`);
    } catch (error) {
        logger.error(`Error sending email to ${options.email}:`, error);
        throw error;
    }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetURL) => {
    await sendEmail({
        email: user.email,
        subject: 'Password Reset Request (valid for 10 minutes)',
        text: `Forgot your password? Submit a request with your new password to: ${resetURL}. If you didn't forget your password, please ignore this email.`,
        html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.name},</p>
      <p>Forgot your password? Click the link below to reset it:</p>
      <a href="${resetURL}">Reset Password</a>
      <p>This link is valid for 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    });
};

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
};
