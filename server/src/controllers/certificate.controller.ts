import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { env } from '../config/env';

const prisma = new PrismaClient();

export async function getMyCertificates(req: Request, res: Response) {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { studentId: req.user!.userId },
      include: { test: { select: { title: true, subject: { select: { name: true } } } } },
      orderBy: { issuedAt: 'desc' },
    });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
}

export async function downloadCertificate(req: Request, res: Response) {
  try {
    const cert = await prisma.certificate.findUnique({ where: { id: req.params.id } });
    if (!cert) { res.status(404).json({ error: 'Certificate not found' }); return; }

    const filePath = path.resolve(env.CERTIFICATES_DIR, cert.filePath);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download certificate' });
  }
}

export async function getTestCertificates(req: Request, res: Response) {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { testId: req.params.testId },
      include: { student: { select: { fullName: true, email: true } } },
    });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
}

export async function generateCertificates(req: Request, res: Response) {
  try {
    const { testId } = req.params;

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { subject: true },
    });
    if (!test) { res.status(404).json({ error: 'Test not found' }); return; }
    if (!test.enableCertificate) { res.status(400).json({ error: 'Certificates not enabled for this test' }); return; }

    // Get all passing students
    const passingAttempts = await prisma.testAttempt.findMany({
      where: {
        testId,
        status: 'COMPLETED',
        percentage: { gte: test.passingPercentage || 0 },
      },
      include: { student: { select: { id: true, fullName: true } } },
    });

    const { certificateGenerator } = await import('../services/certificates/generator');
    let generated = 0;

    for (const attempt of passingAttempts) {
      // Check if certificate already exists
      const existing = await prisma.certificate.findUnique({
        where: { studentId_testId: { studentId: attempt.studentId, testId } },
      });
      if (existing) continue;

      const result = await certificateGenerator.generate({
        studentName: attempt.student.fullName,
        testName: test.title,
        subject: test.subject?.name || '',
        score: attempt.score || 0,
        percentage: attempt.percentage || 0,
        completionDate: attempt.submittedAt || new Date(),
      });

      await prisma.certificate.create({
        data: {
          studentId: attempt.studentId,
          testId,
          certificateId: result.certificateId,
          filePath: result.filePath,
          score: attempt.score || 0,
          percentage: attempt.percentage || 0,
        },
      });
      generated++;
    }

    res.json({
      message: `${generated} certificates generated (${passingAttempts.length} passing students)`,
      generated,
      totalPassing: passingAttempts.length,
    });
  } catch (error: any) {
    console.error('Certificate generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate certificates' });
  }
}

export async function generateSeriesCertificates(req: Request, res: Response) {
  try {
    const { seriesId } = req.params;

    const series = await prisma.testSeries.findUnique({
      where: { id: seriesId },
      include: { tests: { select: { testId: true } } },
    });
    if (!series) { res.status(404).json({ error: 'Series not found' }); return; }
    if (!series.enableCertificate) { res.status(400).json({ error: 'Certificates not enabled for this series' }); return; }

    const testIds = series.tests.map((t) => t.testId);

    // Find students who completed ALL tests in the series
    const students = await prisma.user.findMany({ where: { role: 'STUDENT', status: 'ACTIVE' }, select: { id: true, fullName: true } });

    const { certificateGenerator } = await import('../services/certificates/generator');
    let generated = 0;

    for (const student of students) {
      // Check if completed all tests
      const completedAttempts = await prisma.testAttempt.findMany({
        where: { studentId: student.id, testId: { in: testIds }, status: 'COMPLETED' },
        select: { testId: true, score: true, totalMarks: true },
      });

      const completedTestIds = new Set(completedAttempts.map((a) => a.testId));
      if (completedTestIds.size < testIds.length) continue; // Not all tests completed

      // Calculate cumulative score
      const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const totalMarks = completedAttempts.reduce((sum, a) => sum + (a.totalMarks || 0), 0);
      const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

      if (percentage < (series.passingPercentage || 0)) continue; // Didn't pass

      // Check if certificate already exists (use series name as testId placeholder)
      const existing = await prisma.certificate.findFirst({
        where: { studentId: student.id, certificateId: { startsWith: `SERIES-` } },
      });
      if (existing) continue;

      const result = await certificateGenerator.generate({
        studentName: student.fullName,
        testName: `${series.name} (Series)`,
        subject: 'Multiple Subjects',
        score: totalScore,
        percentage,
        completionDate: new Date(),
      });

      // Store with a special certificateId prefix
      await prisma.certificate.create({
        data: {
          studentId: student.id,
          testId: testIds[0], // Link to first test in series
          certificateId: `SERIES-${result.certificateId}`,
          filePath: result.filePath,
          score: totalScore,
          percentage,
        },
      });
      generated++;
    }

    res.json({ message: `${generated} series certificates generated`, generated });
  } catch (error: any) {
    console.error('Series certificate error:', error.message);
    res.status(500).json({ error: 'Failed to generate series certificates' });
  }
}
