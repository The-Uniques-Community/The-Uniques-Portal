import dotenv from 'dotenv';
dotenv.config();
import transporter from '../../config/emailConfig.js';

export const sendContactEmail = async (contactData) => {
    const { firstName, lastName, email, phone, message, services, enquiryId } = contactData;
    const referenceNumber = enquiryId ? 
        (typeof enquiryId === 'object' ? enquiryId.toString() : enquiryId) : 
        'TUC-' + Date.now().toString().slice(-6);
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'New Enquiry on The Uniques Community',
        html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
        body { background-color: #f9f9f9; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-top: 8px solid #ca0019; border-radius: 8px; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #424e53; }
        .header h1 { color: #ca0019; font-size: 24px; margin-bottom: 10px; }
        .header p { font-size: 14px; color: #424e53; }
        .notification-banner { text-align: center; padding: 16px; background-color: #003366; color: white; border-radius: 6px; margin-top: 20px; }
        .notification-banner h2 { font-size: 20px; font-weight: bold; }
        .message-body { padding: 20px 0; color: #424e53; font-size: 16px; line-height: 1.6; }
        .contact-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; margin: 20px 0; }
        .contact-box h3 { color: #ca0019; margin-bottom: 12px; font-size: 18px; }
        .contact-item { margin-bottom: 8px; }
        .contact-label { font-weight: bold; display: inline-block; width: 120px; }
        .message-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; margin: 20px 0; }
        .message-box h3 { color: #ca0019; margin-bottom: 12px; font-size: 18px; }
        .services-box { background-color: #edf7ed; border: 1px solid #c3e6cb; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .services-title { font-weight: bold; margin-bottom: 10px; color: #28a745; }
        .service-tag { display: inline-block; background-color: #28a745; color: white; padding: 4px 10px; border-radius: 16px; font-size: 12px; margin-right: 6px; margin-bottom: 6px; }
        .cta-button { display: block; width: 200px; margin: 24px auto; padding: 12px 24px; background-color: #ca0019; color: white; text-decoration: none; text-align: center; border-radius: 4px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>A visitor has submitted the contact form on The Uniques Community website.</p>
        </div>
        
        <div class="notification-banner">
            <h2>New Enquiry Received</h2>
        </div>
        
        <div class="message-body">
            <p>A new contact form has been submitted with the following details:</p>
            
            <div class="contact-box">
                <h3>Contact Information</h3>
                <div class="contact-item"><span class="contact-label">Name:</span> ${firstName} ${lastName}</div>
                <div class="contact-item"><span class="contact-label">Email:</span> ${email}</div>
                <div class="contact-item"><span class="contact-label">Phone:</span> ${phone || 'Not provided'}</div>
            </div>
            
            ${services && services.length > 0 ? `
            <div class="services-box">
                <p class="services-title">Interested Services:</p>
                <div>
                    ${services.map(service => `<span class="service-tag">${service}</span>`).join(' ')}
                </div>
            </div>
            ` : ''}
            
            <div class="message-box">
                <h3>Message</h3>
                <p style="white-space: pre-line;">${message}</p>
            </div>
            
            <p>Please respond to this inquiry as soon as possible.</p>
            
            <a href="mailto:${email}" class="cta-button">Reply to ${firstName}</a>
        </div>
        
        <div class="footer">
            <p>This is an automated message from The Uniques Community website contact form.</p>
            <p>&copy; ${new Date().getFullYear()} The Uniques Community. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
        `
    };

    // Send auto-reply to the user
    const userConfirmationOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Enquiry Receipt - The Uniques Community',
        html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Copy of Your Enquiry</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
        body { background-color: #f9f9f9; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-top: 8px solid #ca0019; border-radius: 8px; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #424e53; }
        .header h1 { color: #ca0019; font-size: 24px; margin-bottom: 10px; }
        .header p { font-size: 14px; color: #424e53; }
        .thank-you-banner { text-align: center; padding: 20px; background-color: #ca0019; color: white; border-radius: 6px; margin-top: 20px; }
        .thank-you-banner h2 { font-size: 20px; font-weight: bold; }
        .thank-you-banner p { font-size: 16px; margin-top: 8px; }
        .message-body { padding: 20px 0; color: #424e53; font-size: 16px; line-height: 1.6; }
        .bold { font-weight: bold; color: black; }
        .signature { margin-top: 24px; color: #333; font-size: 14px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
        .social-links { text-align: center; margin: 20px 0; }
        .social-links a { margin: 0 10px; text-decoration: none; color: #ca0019; }
        .enquiry-details { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; margin: 20px 0; }
        .enquiry-details h3 { color: #ca0019; margin-bottom: 12px; font-size: 18px; }
        .detail-item { margin-bottom: 10px; }
        .detail-label { font-weight: bold; display: block; margin-bottom: 5px; color: #555; }
        .detail-value { display: block; padding-left: 15px; }
        .services-list { margin-top: 8px; }
        .service-item { background-color: #e9f5e9; border-radius: 4px; padding: 4px 8px; margin-right: 5px; margin-bottom: 5px; display: inline-block; font-size: 12px; color: #28a745; }
        .message-content { background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin-top: 8px; white-space: pre-line; }
        .reference { background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 10px; border-radius: 4px; margin: 15px 0; font-size: 14px; }
        .timeline-box { background-color: #e8f4fd; border: 1px solid #b8daff; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .timeline-title { font-weight: bold; color: #0c63e4; margin-bottom: 10px; }
        .timeline-step { margin-bottom: 8px; display: flex; }
        .step-number { background-color: #0c63e4; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px; }
        .step-text { flex: 1; }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Your Enquiry Receipt</h1>
            <p>A copy of your submission to The Uniques Community</p>
        </div>
        
        <div class="thank-you-banner">
            <h2>Thank You for Contacting Us</h2>
            <p>We've received your enquiry and will be in touch soon.</p>
        </div>
        
        <div class="message-body">
            <p>Dear <span class="bold">${firstName} ${lastName}</span>,</p>
            <p>Thank you for reaching out to The Uniques Community. This is a confirmation that we have received your enquiry. Below is a copy of the information you've submitted for your records:</p>
            
            <div class="enquiry-details">
                <h3>Your Submission Details</h3>
                
                <div class="detail-item">
                    <span class="detail-label">Full Name:</span>
                    <span class="detail-value">${firstName} ${lastName}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Email Address:</span>
                    <span class="detail-value">${email}</span>
                </div>
                
                ${phone ? `
                <div class="detail-item">
                    <span class="detail-label">Phone Number:</span>
                    <span class="detail-value">${phone}</span>
                </div>
                ` : ''}
                
                ${services && services.length > 0 ? `
                <div class="detail-item">
                    <span class="detail-label">Services You're Interested In:</span>
                    <div class="services-list">
                        ${services.map(service => `<span class="service-item">${service}</span>`).join(' ')}
                    </div>
                </div>
                ` : ''}
                
                <div class="detail-item">
                    <span class="detail-label">Your Message:</span>
                    <div class="message-content">${message}</div>
                </div>
            </div>
            
            <div class="reference">
                <strong>Reference Number:</strong> ${referenceNumber}
                <p style="margin-top: 8px;">Please keep this reference number for future correspondence regarding this enquiry.</p>
            </div>
            
            <div class="timeline-box">
                <p class="timeline-title">What Happens Next?</p>
                
                <div class="timeline-step">
                    <div class="step-number">1</div>
                    <div class="step-text">Our team is currently reviewing your enquiry</div>
                </div>
                
                <div class="timeline-step">
                    <div class="step-number">2</div>
                    <div class="step-text">We'll reach out to you via email or phone within 1-2 business days</div>
                </div>
                
                <div class="timeline-step">
                    <div class="step-number">3</div>
                    <div class="step-text">We'll provide you with the information or assistance you need</div>
                </div>
            </div>
            
            <p>While you wait for our response, you may want to explore our website to learn more about our community, upcoming events, and initiatives.</p>
        </div>
        
        <div class="social-links">
            <p>Connect with us on social media:</p>
            <p style="margin-top: 10px;">
                <a href="https://www.instagram.com/theuniquesofficial" target="_blank">Instagram</a> |
                <a href="https://www.linkedin.com/company/theuniquesofflicial" target="_blank">LinkedIn</a> |
                <a href="https://twitter.com/theuniquescomm" target="_blank">Twitter</a>
            </p>
        </div>
        
        <p class="signature">Best regards,</p>
        <p class="signature">The Uniques Community Team</p>
        
        <div class="footer">
            <p>This is an automated receipt of your submission. Please do not reply directly to this email.</p>
            <p>If you need immediate assistance, please contact us at <a href="mailto:support@theuniquescommunity.org">support@theuniquescommunity.org</a></p>
            <p>&copy; ${new Date().getFullYear()} The Uniques Community. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
        `
    };

    try {
        // Send notification to admin
        await transporter.sendMail(mailOptions);
        
        // Send confirmation with copy to user
        await transporter.sendMail(userConfirmationOptions);
        
        console.log('Contact form emails sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending contact form emails:', error);
        return false;
    }
};

export default sendContactEmail;