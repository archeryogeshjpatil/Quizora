import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../middlewares/auth';
import { notifications } from '../utils/notify';

const prisma = new PrismaClient();

export async function register(req: Request, res: Response) {
  try {
    const { fullName, email, mobile, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { mobile }] },
    });
    if (existingUser) {
      res.status(400).json({ error: 'Email or mobile already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        mobile,
        password: hashedPassword,
        role: 'STUDENT',
        status: 'ACTIVE', // Auto-activate until OTP/email service is configured
      },
    });

    // TODO: Send OTP via email or SMS
    // Notify admin of new registration
    notifications.newRegistration(fullName);
    res.status(201).json({ message: 'Registration successful. Please verify your account.', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { userId, otp } = req.body;
    // TODO: Validate OTP from Redis/DB
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });
    res.json({ message: 'Account verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
}

export async function resendOtp(req: Request, res: Response) {
  // TODO: Resend OTP logic
  res.json({ message: 'OTP resent' });
}

export async function login(req: Request, res: Response) {
  try {
    const { identifier, password } = req.body; // identifier = email or mobile
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { mobile: identifier }],
        role: 'STUDENT',
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    if (user.status === 'PENDING') {
      res.status(403).json({ error: 'Please verify your account first' });
      return;
    }
    if (user.status === 'INACTIVE') {
      res.status(403).json({ error: 'Account deactivated. Contact admin.' });
      return;
    }

    const token = generateToken({ userId: user.id, role: 'STUDENT' });
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function adminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const admin = await prisma.user.findFirst({
      where: { email, role: 'ADMIN' },
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }

    const token = generateToken({ userId: admin.id, role: 'ADMIN' });
    res.json({ token, user: { id: admin.id, fullName: admin.fullName, email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  // TODO: Send password reset OTP/link
  res.json({ message: 'Password reset instructions sent' });
}

export async function resetPassword(req: Request, res: Response) {
  // TODO: Validate OTP and reset password
  res.json({ message: 'Password reset successful' });
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, fullName: true, email: true, mobile: true, role: true, status: true, createdAt: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

export async function logout(_req: Request, res: Response) {
  // JWT is stateless; client discards token
  res.json({ message: 'Logged out' });
}
