import nodemailer from 'nodemailer';
import { env } from '../../config/env';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    await this.getTransporter().sendMail({
      from: `"Quizora" <${env.EMAIL_FROM}>`,
      to,
      subject: 'Quizora - Verify Your Account',
      html: `
        <h2>Welcome to Quizora!</h2>
        <p>Your verification OTP is: <strong>${otp}</strong></p>
        <p>This OTP expires in 15 minutes.</p>
        <p>Powered by Archer Infotech</p>
      `,
    });
  }

  async sendPasswordReset(to: string, otp: string): Promise<void> {
    await this.getTransporter().sendMail({
      from: `"Quizora" <${env.EMAIL_FROM}>`,
      to,
      subject: 'Quizora - Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your password reset OTP is: <strong>${otp}</strong></p>
        <p>This OTP expires in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  }

  async sendResult(to: string, data: {
    studentName: string;
    testName: string;
    subject: string;
    score: number;
    totalMarks: number;
    percentage: number;
    rank?: number;
    certificateLink?: string;
  }): Promise<void> {
    await this.getTransporter().sendMail({
      from: `"Quizora" <${env.EMAIL_FROM}>`,
      to,
      subject: `Quizora - Your Result for ${data.testName}`,
      html: `
        <h2>Exam Result - ${data.testName}</h2>
        <p>Dear ${data.studentName},</p>
        <table border="1" cellpadding="8" cellspacing="0">
          <tr><td><strong>Test</strong></td><td>${data.testName}</td></tr>
          <tr><td><strong>Subject</strong></td><td>${data.subject}</td></tr>
          <tr><td><strong>Score</strong></td><td>${data.score} / ${data.totalMarks}</td></tr>
          <tr><td><strong>Percentage</strong></td><td>${data.percentage}%</td></tr>
          ${data.rank ? `<tr><td><strong>Rank</strong></td><td>${data.rank}</td></tr>` : ''}
        </table>
        ${data.certificateLink ? `<p><a href="${data.certificateLink}">Download Certificate</a></p>` : ''}
        <p>Powered by Archer Infotech</p>
      `,
    });
  }

  async sendTestNotification(to: string, testName: string, startDate: string): Promise<void> {
    await this.getTransporter().sendMail({
      from: `"Quizora" <${env.EMAIL_FROM}>`,
      to,
      subject: `Quizora - New Test Available: ${testName}`,
      html: `
        <h2>New Test Available!</h2>
        <p>A new test <strong>${testName}</strong> is now available.</p>
        <p>Available from: ${startDate}</p>
        <p>Log in to Quizora to take the test.</p>
        <p>Powered by Archer Infotech</p>
      `,
    });
  }
}

export const emailService = new EmailService();
