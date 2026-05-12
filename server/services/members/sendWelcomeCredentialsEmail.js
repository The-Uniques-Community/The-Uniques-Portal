import dotenv from 'dotenv';
dotenv.config();
import transporter from '../../config/emailConfig.js';


export const sendWelcomeCredentialsEmail = async (userEmail, userData, password) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Welcome to The Uniques Community - Your Account Details',
        html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to The Uniques Community</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
        body { background-color: #f9f9f9; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-top: 8px solid #ca0019; border-radius: 8px; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #424e53; }
        .header h1 { color: #ca0019; font-size: 24px; margin-bottom: 10px; }
        .header p { font-size: 14px; color: #424e53; }
        .welcome-banner { text-align: center; padding: 20px; background-color: #27ae60; color: white; border-radius: 6px; margin-top: 20px; }
        .welcome-banner h2 { font-size: 20px; font-weight: bold; }
        .welcome-banner p { font-size: 16px; margin-top: 8px; }
        .message-body { padding: 20px 0; color: #424e53; font-size: 16px; line-height: 1.6; }
        .credentials-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; margin: 20px 0; }
        .credentials-box h3 { color: #ca0019; margin-bottom: 12px; font-size: 18px; }
        .credentials-item { margin-bottom: 8px; }
        .credentials-label { font-weight: bold; display: inline-block; width: 100px; }
        .important-note { background-color: #fff3cd; color: #856404; padding: 12px; border-radius: 6px; margin: 15px 0; font-size: 14px; }
        .cta-button { display: block; width: 200px; margin: 24px auto; padding: 12px 24px; background-color: #ca0019; color: white; text-decoration: none; text-align: center; border-radius: 4px; font-weight: bold; }
        .bold { font-weight: bold; color: black; }
        .signature { margin-top: 24px; color: #333; font-size: 14px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to The Uniques Community!</h1>
            <p>Your account has been created successfully</p>
        </div>
        
        <div class="welcome-banner">
            <h2>You're In!</h2>
            <p>Your membership has been confirmed. Get ready to connect, collaborate and grow with us.</p>
        </div>
        
        <div class="message-body">
            <p>Dear <span class="bold">${userData.fullName}</span>,</p>
            <p>We are delighted to welcome you to <b>The Uniques Community</b>. Your account has been created successfully and you can now access all the resources, events, and networking opportunities available to our members.</p>
            
            <div class="credentials-box">
                <h3>Your Login Credentials</h3>
                <div class="credentials-item"><span class="credentials-label">Email:</span> ${userData.email}</div>
                <div class="credentials-item"><span class="credentials-label">Password:</span> ${password}</div>
                <div class="credentials-item"><span class="credentials-label">Batch:</span> ${userData.batch}</div>
            </div>
            
            <div class="important-note">
                <strong>Important:</strong> For security reasons, please change your password after your first login. Your account contains personal information, so please keep your credentials secure.
            </div>
            
            <p>You can log in to your account by visiting our website and using the credentials provided above.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://www.theuniquescommunity.org'}/login" class="cta-button">Login Now</a>
            
            <p>As a member of The Uniques Community, you'll have access to:</p>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li>Exclusive networking events and webinars</li>
                <li>Skill development resources and workshops</li>
                <li>Collaborative project opportunities</li>
                <li>Mentorship from industry professionals</li>
                <li>A supportive community of like-minded individuals</li>
            </ul>
        </div>
        
        <p class="signature">We look forward to your active participation!</p>
        <p class="signature">Best regards,</p>
        <p class="signature">The Uniques Community Team</p>
        
        <div class="footer">
            <p>If you have any questions or need assistance, please contact us at <a href="mailto:support@theuniquescommunity.org">support@theuniquescommunity.org</a></p>
            <p>&copy; 2024 The Uniques Community. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email with credentials sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending welcome credentials email:', error);
        return false;
    }
};

export default sendWelcomeCredentialsEmail;