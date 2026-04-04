import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { loginLimiter, otpLimiter } from '../middlewares/rateLimiter';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Student registration & verification
router.post('/register', authController.register);
router.post('/verify-otp', otpLimiter, authController.verifyOtp);
router.post('/resend-otp', otpLimiter, authController.resendOtp);

// Login
router.post('/login', loginLimiter, authController.login);
router.post('/admin/login', loginLimiter, authController.adminLogin);

// Password reset
router.post('/forgot-password', otpLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Session
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

export default router;
