import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Email User:', process.env.EMAIL_USER);
console.log('Password length:', process.env.EMAIL_PASS?.length);

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
transporter.verify((error, success) => {
    if (error) {
        console.log('Email config error:', error);
    } else {
        console.log('Email server is ready to take our messages');
    }
});

export default transporter;
