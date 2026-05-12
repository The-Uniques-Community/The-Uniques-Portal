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