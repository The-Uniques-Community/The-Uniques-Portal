/**
 * @file passwordReset.controller.js
 * @description Cryptographically secure, serverless-native password reset controller.
 * @architecture Mounted at `/auth/password-reset` via `routes/member/otpRoute.js`.
 * Persists OTP tokens to MongoDB with native TTL expiration and attempt rate-limiting.
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import OtpToken from "../../models/auth/OtpToken.js";
import Member from "../../models/member/memberModel.js";
import Admin from "../../models/admin/adminModel.js";
import CommunityAdmin from "../../models/community/communityAdmin.js";
import User from "../../models/user/userModel.js";
import transporter from "../../config/emailConfig.js";

const PEPPER = process.env.OTP_SECRET || process.env.OTP_PEPPER || process.env.JWT_SECRET || "the-uniques-portal-otp-salt";

export const hashOTP = (otp, email = "") => {
  const normalizedEmail = (email || "").toLowerCase().trim();
  const content = normalizedEmail ? `${normalizedEmail}:${otp.toString().trim()}` : otp.toString().trim();
  return crypto.createHmac("sha256", PEPPER).update(content).digest("hex");
};

export const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};
export const generateSecureOTP = generateOTP;

export const sendOTPEmail = async (email, otp, name = "User") => {
  const mailOptions = {
    from: `"The Uniques Community" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset - OTP Verification",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ca0019; margin: 0;">The Uniques Community</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            We received a request to reset your password. Use the following OTP to proceed:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #ca0019; color: white; padding: 15px 30px; border-radius: 5px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
              ${otp}
            </div>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { success: false, error: error.message };
  }
};

const escapeRegex = (string) => string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");

export const findUserByEmail = async (email) => {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();
  const regex = new RegExp(`^${escapeRegex(normalized)}$`, "i");

  if (User) {
    try {
      const user = (await User.findOne({ email: normalized })) || (await User.findOne({ email: regex }));
      if (user) return { user, model: "User" };
    } catch (_err) {
      // Ignored: fallback to individual role models
    }
  }

  let user = (await Member.findOne({ email: normalized })) || (await Member.findOne({ email: regex }));
  if (user) return { user, model: "Member" };

  user = (await Admin.findOne({ email: normalized })) || (await Admin.findOne({ email: regex }));
  if (user) return { user, model: "Admin" };

  user = (await CommunityAdmin.findOne({ email: normalized })) || (await CommunityAdmin.findOne({ email: regex }));
  if (user) return { user, model: "CommunityAdmin" };

  return null;
};

export const updateUserPassword = async (email, newPassword, model) => {
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  const normalized = email.toLowerCase().trim();
  const regex = new RegExp(`^${escapeRegex(normalized)}$`, "i");
  const Model = model === "User" ? User : model === "Admin" ? Admin : model === "CommunityAdmin" ? CommunityAdmin : Member;

  return await Model.findOneAndUpdate(
    { $or: [{ email: normalized }, { email: regex }] },
    {
      $set: { password: hashedPassword },
      $inc: { tokenVersion: 1 },
    },
    { new: true }
  );
};

// STEP 1: Send OTP to email
export const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const account = await findUserByEmail(normalizedEmail);

    // Account enumeration defense: generic success if account does not exist
    if (!account) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, an OTP has been sent.",
      });
    }

    const { user } = account;
    const otp = generateOTP();
    const otpHash = hashOTP(otp, normalizedEmail);

    // Atomically replace existing tokens for this email
    await OtpToken.deleteMany({ email: normalizedEmail });
    await OtpToken.create({
      email: normalizedEmail,
      otpHash,
      verified: false,
      attempts: 0,
      createdAt: new Date(),
    });

    await sendOTPEmail(normalizedEmail, otp, user.fullName || user.name || "User");

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your registered email address.",
    });
  } catch (error) {
    console.error("sendResetOTP error:", error);
    return res.status(500).json({ success: false, message: "Failed to send reset OTP" });
  }
};

// STEP 2: Verify OTP
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const tokenDoc = await OtpToken.findOne({ email: normalizedEmail });

    if (!tokenDoc || !tokenDoc.otpHash) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired. Please request a new OTP.",
      });
    }

    // Explicit TTL check in addition to MongoDB background monitor
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (tokenDoc.createdAt && tokenDoc.createdAt < tenMinutesAgo) {
      await OtpToken.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (tokenDoc.attempts >= 5) {
      await OtpToken.deleteOne({ _id: tokenDoc._id });
      return res.status(429).json({
        success: false,
        message: "Maximum OTP verification attempts exceeded. Please request a new OTP.",
      });
    }

    const expectedHash = hashOTP(otp, normalizedEmail);
    const incomingBuffer = Buffer.from(expectedHash, "hex");
    const storedBuffer = Buffer.from(tokenDoc.otpHash, "hex");
    const isValid =
      incomingBuffer.length === storedBuffer.length &&
      crypto.timingSafeEqual(incomingBuffer, storedBuffer);

    if (!isValid) {
      const updated = await OtpToken.findByIdAndUpdate(
        tokenDoc._id,
        { $inc: { attempts: 1 } },
        { new: true }
      );
      const remaining = 5 - (updated ? updated.attempts : tokenDoc.attempts + 1);
      if (remaining <= 0) {
        await OtpToken.deleteOne({ _id: tokenDoc._id });
        return res.status(429).json({
          success: false,
          message: "Maximum verification attempts exceeded. Please request a new OTP.",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remaining} attempt(s) remaining.`,
      });
    }

    // Generate single-use random reset authorization token
    const resetSessionToken = crypto.randomBytes(32).toString("hex");
    tokenDoc.verified = true;
    tokenDoc.resetSessionToken = resetSessionToken;
    await tokenDoc.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetSessionToken,
      resetToken: resetSessionToken, // Backward compatibility with ForgetPassword.jsx
    });
  } catch (error) {
    console.error("verifyResetOTP error:", error);
    return res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};

// STEP 3: Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    const sessionToken = req.body.resetSessionToken || req.body.resetToken;

    if (!email || !newPassword || !sessionToken) {
      return res.status(400).json({
        success: false,
        message: "Email, new password, and resetSessionToken are required",
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const tokenDoc = await OtpToken.findOne({
      email: normalizedEmail,
      verified: true,
      resetSessionToken: sessionToken,
    });

    if (!tokenDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset session. Please verify OTP again.",
      });
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (tokenDoc.createdAt && tokenDoc.createdAt < tenMinutesAgo) {
      await OtpToken.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({
        success: false,
        message: "Password reset session has expired. Please verify OTP again.",
      });
    }

    const account = await findUserByEmail(normalizedEmail);
    if (!account) {
      await OtpToken.deleteOne({ _id: tokenDoc._id });
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    // Update password across models and increment tokenVersion
    await updateUserPassword(normalizedEmail, newPassword, account.model);

    // Invalidate token immediately
    await OtpToken.deleteOne({ _id: tokenDoc._id });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in with your new credentials.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

export const resendOTP = async (req, res) => {
  return sendResetOTP(req, res);
};