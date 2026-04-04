import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Analyze answer patterns for a test and flag suspicious similarities
export async function analyzeTest(req: Request, res: Response) {
  try {
    const { testId } = req.params;

    const attempts = await prisma.testAttempt.findMany({
      where: { testId, status: 'COMPLETED' },
      include: { student: { select: { id: true, fullName: true } } },
    });

    if (attempts.length < 2) {
      res.json({ message: 'Need at least 2 attempts to detect plagiarism', flags: [] });
      return;
    }

    const flags: any[] = [];

    // Compare each pair of students
    for (let i = 0; i < attempts.length; i++) {
      for (let j = i + 1; j < attempts.length; j++) {
        const a1 = attempts[i];
        const a2 = attempts[j];
        const r1 = a1.responses ? JSON.parse(a1.responses) : {};
        const r2 = a2.responses ? JSON.parse(a2.responses) : {};

        // Calculate answer similarity
        const allKeys = new Set([...Object.keys(r1), ...Object.keys(r2)]);
        let matches = 0;
        let total = allKeys.size;

        for (const key of allKeys) {
          if (r1[key] && r2[key] && r1[key] === r2[key]) matches++;
        }

        const similarity = total > 0 ? Math.round((matches / total) * 100) : 0;

        // Flag if similarity > 80%
        if (similarity > 80) {
          // Check if already flagged
          const existing = await prisma.plagiarismFlag.findFirst({
            where: { testId, studentAId: a1.studentId, studentBId: a2.studentId },
          });

          if (!existing) {
            await prisma.plagiarismFlag.create({
              data: {
                testId,
                studentAId: a1.studentId,
                studentBId: a2.studentId,
                similarityScore: similarity,
                details: `${matches}/${total} answers identical`,
              },
            });
          }

          flags.push({
            studentA: a1.student.fullName,
            studentB: a2.student.fullName,
            similarity,
            details: `${matches}/${total} answers identical`,
          });
        }
      }
    }

    // Check for unusually fast completion
    const avgTime = attempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / attempts.length;
    const fastStudents = attempts.filter((a) => (a.timeTaken || 0) < avgTime * 0.3);
    for (const fast of fastStudents) {
      flags.push({
        studentA: fast.student.fullName,
        studentB: null,
        similarity: 0,
        details: `Unusually fast: ${Math.round((fast.timeTaken || 0) / 60)}min vs avg ${Math.round(avgTime / 60)}min`,
        type: 'QUICK_COMPLETION',
      });
    }

    // Tab-switch correlation with performance spikes
    const avgPercentage = attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length;
    const highSwitchStudents = attempts.filter((a) => a.tabSwitchCount > 3);
    for (const student of highSwitchStudents) {
      const performanceSpike = (student.percentage || 0) > avgPercentage * 1.3;
      if (performanceSpike) {
        flags.push({
          studentA: student.student.fullName,
          studentB: null,
          similarity: 0,
          details: `${student.tabSwitchCount} tab switches + score ${student.percentage}% (avg: ${Math.round(avgPercentage)}%) — possible external help`,
          type: 'TAB_SWITCH_CORRELATION',
        });
      }
    }

    res.json({ flags, analyzed: attempts.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze plagiarism' });
  }
}

export async function getFlags(req: Request, res: Response) {
  try {
    const flags = await prisma.plagiarismFlag.findMany({
      where: { testId: req.params.testId },
      orderBy: { similarityScore: 'desc' },
    });
    res.json(flags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flags' });
  }
}

export async function reviewFlag(req: Request, res: Response) {
  try {
    const { action } = req.body; // 'ACCEPTED' or 'DISQUALIFIED'
    await prisma.plagiarismFlag.update({
      where: { id: req.params.id },
      data: { reviewed: true, action },
    });
    res.json({ message: 'Flag reviewed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to review flag' });
  }
}
