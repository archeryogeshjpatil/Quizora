import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function notify(data: {
  type: string;
  title: string;
  message: string;
  targetRole: 'ADMIN' | 'STUDENT';
  targetUserId?: string;
}) {
  try {
    await prisma.notification.create({ data: data as any });
  } catch (err) {
    console.error('Notification error:', err);
  }
}

// Pre-built notification helpers
export const notifications = {
  testAvailable: (testTitle: string) =>
    notify({ type: 'TEST_AVAILABLE', title: 'New Test Available', message: `${testTitle} is now available.`, targetRole: 'STUDENT' }),

  resultPublished: (testTitle: string, studentId: string) =>
    notify({ type: 'RESULT_PUBLISHED', title: 'Result Published', message: `Your result for ${testTitle} is now available.`, targetRole: 'STUDENT', targetUserId: studentId }),

  certificateReady: (testTitle: string, studentId: string) =>
    notify({ type: 'CERTIFICATE_READY', title: 'Certificate Ready', message: `Your certificate for ${testTitle} is ready to download.`, targetRole: 'STUDENT', targetUserId: studentId }),

  newRegistration: (studentName: string) =>
    notify({ type: 'NEW_REGISTRATION', title: 'New Student Registered', message: `${studentName} has registered.`, targetRole: 'ADMIN' }),

  proctoringAnomaly: (testTitle: string, studentName: string) =>
    notify({ type: 'PROCTORING_ANOMALY', title: 'Proctoring Alert', message: `Anomaly detected for ${studentName} in ${testTitle}.`, targetRole: 'ADMIN' }),

  plagiarismFlag: (testTitle: string) =>
    notify({ type: 'PLAGIARISM_FLAG', title: 'Plagiarism Detected', message: `Suspicious patterns found in ${testTitle}.`, targetRole: 'ADMIN' }),

  aiGenerationComplete: (count: number) =>
    notify({ type: 'AI_GENERATION_COMPLETE', title: 'AI Generation Complete', message: `${count} questions generated successfully.`, targetRole: 'ADMIN' }),

  bulkImportComplete: (imported: number, total: number) =>
    notify({ type: 'BULK_IMPORT_COMPLETE', title: 'Bulk Import Complete', message: `${imported}/${total} questions imported.`, targetRole: 'ADMIN' }),

  dispatchExecuted: (testTitle: string, count: number) =>
    notify({ type: 'DISPATCH_EXECUTED', title: 'Results Dispatched', message: `Results for ${testTitle} sent to ${count} students.`, targetRole: 'ADMIN' }),
};
