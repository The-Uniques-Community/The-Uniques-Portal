import Member from "../../models/member/memberModel.js";
import Admin from "../../models/admin/adminModel.js";
import CommunityAdmin from "../../models/community/communityAdmin.js";
import bcrypt from "bcrypt";
import transporter from "../../config/emailConfig.js";




// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, name = 'User') => {
  const mailOptions = {
    from: `"The Uniques Community" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset - OTP Verification',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ca0019; margin: 0;">The Uniques Community</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Hello ${name},
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            We received a request to reset your password. Use the following OTP to proceed with password reset:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #ca0019; color: white; padding: 15px 30px; border-radius: 5px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            This OTP is valid for 10 minutes. If you didn't request this password reset, please ignore this email.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This email was sent by The Uniques Community. If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Clean up expired OTPs every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) { // 10 minutes
      otpStore.delete(email);
    }
  }
}, 10 * 60 * 1000);

// Helper function to find user in any model
const findUserByEmail = async (email) => {
  // Try Member model first
  let user = await Member.findOne({ email });
  if (user) return { user, model: 'Member' };

  // Try Admin model
  user = await Admin.findOne({ email });
  if (user) return { user, model: 'Admin' };

  // Try CommunityAdmin model
  user = await CommunityAdmin.findOne({ email });
  if (user) return { user, model: 'CommunityAdmin' };

  return null;
};

// Helper function to update user password
const updateUserPassword = async (email, newPassword, model) => {
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  switch (model) {
    case 'Member':
      return await Member.findOneAndUpdate({ email }, { password: hashedPassword });
    case 'Admin':
      return await Admin.findOneAndUpdate({ email }, { password: hashedPassword });
    case 'CommunityAdmin':
      return await CommunityAdmin.findOneAndUpdate({ email }, { password: hashedPassword });
    default:
      throw new Error('Invalid user model');
  }
};

// Step 1: Send OTP to email
export const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    // Check if user exists in any model
    const result = await findUserByEmail(email);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: "No account found with this email address" 
      });
    }

    const { user } = result;

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with timestamp
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      verified: false
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, user.fullName || user.name || 'User');
    
    if (!emailResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send OTP email. Please try again." 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "OTP sent successfully to your email address" 
    });

  } catch (error) {
    console.error('Error in sendResetOTP:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Step 2: Verify OTP
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and OTP are required" 
      });
    }

    // Check if OTP exists for this email
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP not found or expired. Please request a new one." 
      });
    }

    // Check if OTP is expired (10 minutes)
    const now = Date.now();
    if (now - storedData.timestamp > 10 * 60 * 1000) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: "OTP has expired. Please request a new one." 
      });
    }

    // Check if OTP matches
    if (storedData.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP. Please try again." 
      });
    }

    // Mark OTP as verified
    otpStore.set(email, {
      ...storedData,
      verified: true
    });

    res.status(200).json({ 
      success: true, 
      message: "OTP verified successfully" 
    });

  } catch (error) {
    console.error('Error in verifyResetOTP:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Step 3: Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Passwords do not match" 
      });
    }

    // Check password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if OTP was verified for this email
    const storedData = otpStore.get(email);
    
    if (!storedData || !storedData.verified) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP verification required. Please verify OTP first." 
      });
    }

    // Check if OTP is still valid
    const now = Date.now();
    if (now - storedData.timestamp > 10 * 60 * 1000) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: "Session expired. Please start the password reset process again." 
      });
    }

    // Find user and get model type
    const result = await findUserByEmail(email);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const { user, model } = result;

    // Update password
    await updateUserPassword(email, newPassword, model);

    // Clean up OTP
    otpStore.delete(email);

    res.status(200).json({ 
      success: true, 
      message: "Password reset successfully" 
    });

  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    // Check if user exists
    const result = await findUserByEmail(email);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: "No account found with this email address" 
      });
    }

    const { user } = result;

    // Generate new OTP
    const otp = generateOTP();
    
    // Store new OTP
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      verified: false
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, user.fullName || user.name || 'User');
    
    if (!emailResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send OTP email. Please try again." 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "New OTP sent successfully to your email address" 
    });

  } catch (error) {
    console.error('Error in resendOTP:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};