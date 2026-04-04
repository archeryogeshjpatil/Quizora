import { PrismaClient } from '@prisma/client';
import { emailService } from '../services/messaging/email';
import { telegramService } from '../services/messaging/telegram';

const prisma = new PrismaClient();

let running = false;

/**
 * Check for due scheduled dispatches and execute them.
 * Runs every 60 seconds.
 */
export function startScheduledDispatchRunner() {
  console.log('✓ Scheduled dispatch runner started (checks every 60s)');

  setInterval(async () => {
    if (running) return;
    running = true;

    try {
      const now = new Date();
      const dueDispatches = await prisma.dispatchLog.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: { lte: now },
        },
        take: 50,
      });

      if (dueDispatches.length === 0) { running = false; return; }

      console.log(`Processing ${dueDispatches.length} scheduled dispatches...`);

      for (const dispatch of dueDispatches) {
        try {
          // Get student and test info
          const attempt = dispatch.studentId ? await prisma.testAttempt.findFirst({
            where: { testId: dispatch.testId, studentId: dispatch.studentId, status: 'COMPLETED' },
            include: {
              student: { select: { fullName: true, email: true, mobile: true } },
              test: { select: { title: true, subject: { select: { name: true } } } },
            },
          }) : null;

          if (!attempt) {
            await prisma.dispatchLog.update({
              where: { id: dispatch.id },
              data: { status: 'FAILED', errorMessage: 'No completed attempt found' },
            });
            continue;
          }

          const resultData = {
            studentName: attempt.student.fullName,
            testName: attempt.test.title,
            subject: attempt.test.subject?.name || '',
            score: attempt.score || 0,
            totalMarks: attempt.totalMarks || 0,
            percentage: attempt.percentage || 0,
          };

          let success = false;

          if (dispatch.channel === 'EMAIL') {
            await emailService.sendResult(attempt.student.email, resultData);
            success = true;
          } else if (dispatch.channel === 'TELEGRAM') {
            // Note: chatId needs to be stored per student — using mobile as placeholder
            success = await telegramService.sendResult(attempt.student.mobile, resultData);
            if (!success) {
              // Fallback to email
              await emailService.sendResult(attempt.student.email, resultData);
              success = true;
            }
          }
          // WHATSAPP: handled when configured

          await prisma.dispatchLog.update({
            where: { id: dispatch.id },
            data: {
              status: success ? 'SENT' : 'FAILED',
              sentAt: success ? new Date() : undefined,
              errorMessage: success ? undefined : 'Dispatch failed — sent via email fallback',
            },
          });
        } catch (err: any) {
          await prisma.dispatchLog.update({
            where: { id: dispatch.id },
            data: { status: 'FAILED', errorMessage: err.message },
          });
        }
      }
    } catch (err: any) {
      console.error('Dispatch runner error:', err.message);
    } finally {
      running = false;
    }
  }, 60000); // Every 60 seconds
}
