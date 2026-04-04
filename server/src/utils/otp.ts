import { getRedis } from '../config/redis';

const OTP_EXPIRY = 15 * 60; // 15 minutes in seconds

/**
 * Generate a 6-digit OTP
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP in Redis with 15-minute expiry
 * Key format: otp:register:{userId} or otp:reset:{identifier}
 */
export async function storeOtp(key: string, otp: string): Promise<void> {
  const redis = getRedis();
  await redis.setex(`otp:${key}`, OTP_EXPIRY, otp);
}

/**
 * Validate OTP from Redis
 * Returns true if OTP matches and deletes it (one-time use)
 */
export async function validateOtp(key: string, otp: string): Promise<boolean> {
  const redis = getRedis();
  const stored = await redis.get(`otp:${key}`);
  if (stored === otp) {
    await redis.del(`otp:${key}`);
    return true;
  }
  return false;
}

/**
 * Delete OTP (for resend flow)
 */
export async function deleteOtp(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`otp:${key}`);
}

/*
 * INTEGRATION GUIDE:
 *
 * To enable OTP verification:
 *
 * 1. In auth.controller.ts register():
 *    - Change status from 'ACTIVE' to 'PENDING'
 *    - Call generateOtp() and storeOtp(`register:${user.id}`, otp)
 *    - Send OTP via emailService.sendOtp(user.email, otp)
 *
 * 2. In auth.controller.ts verifyOtp():
 *    - Call validateOtp(`register:${userId}`, otp)
 *    - If valid, update user status to 'ACTIVE'
 *
 * 3. In auth.controller.ts forgotPassword():
 *    - Generate OTP, store with storeOtp(`reset:${identifier}`, otp)
 *    - Send via emailService.sendPasswordReset(email, otp)
 *
 * 4. In auth.controller.ts resetPassword():
 *    - Validate OTP with validateOtp(`reset:${identifier}`, otp)
 *    - If valid, update password
 *
 * Prerequisites:
 *    - Redis must be running
 *    - Email SMTP credentials must be configured in .env
 */
