/**
 * @file otpRoute.js
 * @description Password recovery router orchestrating OTP generation, email dispatch, verification, and password reset.
 * @architecture Mounted at `/auth/password-reset` in server/index.js, providing a 3-step OTP recovery flow via passwordReset.controller.
 * @agent_note Four-endpoint workflow: `/send-otp` -> `/verify-otp` -> `/reset-password` with optional `/resend-otp`.
 */
import express from 'express';
import { 
  sendResetOTP, 
  verifyResetOTP, 
  resetPassword, 
  resendOTP 
} from '../../controller/Authentication/passwordReset.controller.js';

const router = express.Router();

// Step 1: Send OTP to email
router.post('/send-otp', sendResetOTP);

// Step 2: Verify OTP
router.post('/verify-otp', verifyResetOTP);

// Step 3: Reset password
router.post('/reset-password', resetPassword);

// Resend OTP
router.post('/resend-otp', resendOTP);

export default router;