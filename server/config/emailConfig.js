/**
 * @file emailConfig.js
 * @description Configures and initializes the Nodemailer SMTP transporter for sending application emails.
 * @architecture Central mail transportation configuration imported across all email notification services.
 * @agent_note Relies on EMAIL_USER and EMAIL_PASS environment variables; verifies SMTP connection on initial load.
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Email User:', process.env.EMAIL_USER);
console.log('Password length:', process.env.EMAIL_PASS?.length);

/**
 * Nodemailer SMTP transport instance configured for Gmail service.
 * @type {import('nodemailer').Transporter}
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER?.trim(),  
        pass: process.env.EMAIL_PASS?.trim()
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify the connection
transporter.verify((error, _success) => {
    if (error) {
        console.log('Email config error:', error);
    } else {
        console.log('Email server is ready to take our messages');
    }
});

/**
 * @module emailTransporter
 */
export default transporter;
