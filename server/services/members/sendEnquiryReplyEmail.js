import dotenv from 'dotenv';
dotenv.config();
import transporter from '../../config/emailConfig.js';

export const sendEnquiryReplyEmail = async (data) => {
    const { email, firstName, lastName, originalMessage, replyMessage, respondedBy } = data;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Response to Your Enquiry - The Uniques Community',
        html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Response to Your Enquiry</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
        body { background-color: #f9f9f9; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-top: 8px solid #ca0019; border-radius: 8px; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #424e53; }
        .header h1 { color: #ca0019; font-size: 24px; margin-bottom: 10px; }
        .header p { font-size: 14px; color: #424e53; }
        .reply-banner { text-align: center; padding: 20px; background-color: #2c3e50; color: white; border-radius: 6px; margin-top: 20px; }
        .reply-banner h2 { font-size: 20px; font-weight: bold; }
        .message-body { padding: 20px 0; color: #424e53; font-size: 16px; line-height: 1.6; }
        .original-message { background-color: #f8f9fa; border-left: 4px solid #ca0019; padding: 15px; margin: 15px 0; font-style: italic; color: #555; }
        .reply-message { background-color: #edf7ed; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; }
        .bold { font-weight: bold; color: black; }
        .signature { margin-top: 24px; color: #333; font-size: 14px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
        .cta-button { display: block; width: 200px; margin: 24px auto; padding: 12px 24px; background-color: #ca0019; color: white; text-decoration: none; text-align: center; border-radius: 4px; font-weight: bold; }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Response to Your Enquiry</h1>
            <p>We've replied to your message.</p>
        </div>
        
        <div class="reply-banner">
            <h2>Thank You for Reaching Out</h2>
        </div>
        
        <div class="message-body">
            <p>Dear <span class="bold">${firstName} ${lastName}</span>,</p>
            <p>Thank you for contacting The Uniques Community. We've received your message and have the following response:</p>
            
            <div class="original-message">
                <p><strong>Your original message:</strong></p>
                <p style="margin-top: 10px;">${originalMessage}</p>
            </div>
            
            <div class="reply-message">
                <p><strong>Our response:</strong></p>
                <p style="margin-top: 10px; white-space: pre-line;">${replyMessage}</p>
            </div>
            
            <p>If you have any further questions or need additional information, please don't hesitate to reach out to us again.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://www.theuniquescommunity.org'}/contact" class="cta-button">Contact Us Again</a>
        </div>
        
        <p class="signature">Best regards,</p>
        <p class="signature">${respondedBy}</p>
        <p class="signature">The Uniques Community</p>
        
        <div class="footer">
            <p>This email is in response to an enquiry you submitted on The Uniques Community website.</p>
            <p>&copy; ${new Date().getFullYear()} The Uniques Community. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reply email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending enquiry reply email:', error);
        return false;
    }
};

export default sendEnquiryReplyEmail;