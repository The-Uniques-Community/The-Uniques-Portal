import dotenv from 'dotenv';
dotenv.config();
import transporter from '../../config/emailConfig.js';

export const sendPendingApprovalEmail = async (userEmail, fname) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Your Account is Pending Approval - The Uniques Community',
        html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Pending Approval</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
        body { background-color: #f9f9f9; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-top: 8px solid #ca0019; border-radius: 8px; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #424e53; }
        .header h1 { color: #ca0019; font-size: 24px; margin-bottom: 10px; }
        .header p { font-size: 14px; color: #424e53; }
        .main-content { text-align: center; padding: 20px; background-color: #f3a002; color: white; border-radius: 6px; margin-top: 20px; }
        .main-content h2 { font-size: 20px; font-weight: bold; }
        .main-content p { font-size: 16px; margin-top: 8px; }
        .message-body { padding: 20px 0; color: #424e53; font-size: 16px; line-height: 1.6; }
        .bold { font-weight: bold; color: black; }
        .signature { margin-top: 24px; color: #333; font-size: 14px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Your Account is Pending Approval</h1>
            <p>Thank you for signing up! Your account is under review.</p>
        </div>
        <div class="main-content">
            <h2>Approval in Progress</h2>
            <p>Our team is reviewing your account. You'll receive a confirmation email once approved.</p>
        </div>
        <div class="message-body">
            <p>Dear <span class="bold">${fname}</span>,</p>
            <p>We appreciate your interest in joining <b>The Uniques Community</b>. Our admin/coordinator team is currently reviewing your account. This process ensures a safe and valuable experience for all members.</p>
            <p>You will be notified via email once your account has been approved.</p>
            <p>For any questions, feel free to reach out.</p>
        </div>
        <p class="signature">Best regards,</p>
        <p class="signature">The Uniques Community Team</p>
        <div class="footer">
            <p>&copy; 2024 The Uniques Community. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Pending approval email sent successfully');
    } catch (error) {
        console.error('Error sending pending approval email:', error);
    }
};


