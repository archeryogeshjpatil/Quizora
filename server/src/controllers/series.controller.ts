import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAll(_req: Request, res: Response) {
  try {
    const series = await prisma.testSeries.findMany({
      include: {
        tests: {
          include: { test: { include: { subject: true, _count: { select: { questions: true } } } } },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch series' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const series = await prisma.testSeries.findUnique({
      where: { id: req.params.id },
      include: {
        tests: {
          include: { test: { include: { subject: true, _count: { select: { questions: true } } } } },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (!series) { res.status(404).json({ error: 'Series not found' }); return; }
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch series' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { name, description, scoringMethod, passingPercentage, enableCertificate, testIds } = req.body;
    const series = await prisma.testSeries.create({
      data: {
        name,
        description,
        scoringMethod: scoringMethod || 'SUM',
        passingPercentage,
        enableCertificate: enableCertificate || false,
        tests: testIds ? {
          create: testIds.map((tId: string, i: number) => ({ testId: tId, orderIndex: i + 1 })),
        } : undefined,
      },
      include: { tests: { include: { test: true } } },
    });
    res.status(201).json(series);
  } catch (error) {
    console.error('Create series error:', error);
    res.status(500).json({ error: 'Failed to create series' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { testIds, ...data } = req.body;
    if (testIds) {
      await prisma.seriesTest.deleteMany({ where: { seriesId: req.params.id } });
      await prisma.seriesTest.createMany({
        data: testIds.map((tId: string, i: number) => ({
          seriesId: req.params.id, testId: tId, orderIndex: i + 1,
        })),
      });
    }
    const series = await prisma.testSeries.update({
      where: { id: req.params.id },
      data,
      include: { tests: { include: { test: true } } },
    });
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update series' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await prisma.seriesTest.deleteMany({ where: { seriesId: req.params.id } });
    await prisma.testSeries.delete({ where: { id: req.params.id } });
    res.json({ message: 'Series deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete series' });
  }
}

export async function getLeaderboard(req: Request, res: Response) {
  try {
    const series = await prisma.testSeries.findUnique({
      where: { id: req.params.id },
      include: { tests: { select: { testId: true } } },
    });
    if (!series) { res.status(404).json({ error: 'Series not found' }); return; }

    const testIds = series.tests.map((t) => t.testId);

    // Get all completed attempts for tests in this series
    const attempts = await prisma.testAttempt.findMany({
      where: { testId: { in: testIds }, status: 'COMPLETED' },
      include: { student: { select: { fullName: true } } },
    });

    // Group by student, calculate cumulative score
    const studentScores: Record<string, { name: string; totalScore: number; totalMarks: number; testsCompleted: number; totalTime: number }> = {};
    for (const a of attempts) {
      if (!studentScores[a.studentId]) {
        studentScores[a.studentId] = { name: a.student.fullName, totalScore: 0, totalMarks: 0, testsCompleted: 0, totalTime: 0 };
      }
      const s = studentScores[a.studentId];
      s.totalScore += a.score || 0;
      s.totalMarks += a.totalMarks || 0;
      s.testsCompleted++;
      s.totalTime += a.timeTaken || 0;
    }

    const leaderboard = Object.values(studentScores)
      .map((s) => ({
        studentName: s.name,
        score: s.totalScore,
        percentage: s.totalMarks > 0 ? Math.round((s.totalScore / s.totalMarks) * 100) : 0,
        testsCompleted: s.testsCompleted,
        timeTaken: s.totalTime,
      }))
      .sort((a, b) => b.score - a.score)
      .map((s, i) => ({ rank: i + 1, ...s }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

// Student: get series with their progress
export async function getStudentSeries(req: Request, res: Response) {
  try {
    const studentId = req.user!.userId;
    const allSeries = await prisma.testSeries.findMany({
      include: {
        tests: {
          include: { test: { select: { id: true, title: true, subject: { select: { name: true } } } } },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    const result = await Promise.all(allSeries.map(async (s) => {
      const testIds = s.tests.map((t) => t.testId);
      const completedAttempts = await prisma.testAttempt.findMany({
        where: { studentId, testId: { in: testIds }, status: 'COMPLETED' },
        select: { testId: true, score: true, totalMarks: true },
      });
      const completedTestIds = new Set(completedAttempts.map((a) => a.testId));
      const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const totalMarks = completedAttempts.reduce((sum, a) => sum + (a.totalMarks || 0), 0);

      return {
        ...s,
        progress: {
          completed: completedTestIds.size,
          total: testIds.length,
          totalScore,
          totalMarks,
          percentage: totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0,
        },
      };
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch series' });
  }
}
