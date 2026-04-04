import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getStudentDashboard(req: Request, res: Response) {
  try {
    const studentId = req.user!.userId;
    const [totalAttempts, avgScore, bestScore] = await Promise.all([
      prisma.testAttempt.count({ where: { studentId, status: 'COMPLETED' } }),
      prisma.testAttempt.aggregate({ where: { studentId, status: 'COMPLETED' }, _avg: { percentage: true } }),
      prisma.testAttempt.aggregate({ where: { studentId, status: 'COMPLETED' }, _max: { percentage: true } }),
    ]);
    res.json({ totalAttempts, avgPercentage: avgScore._avg.percentage, bestPercentage: bestScore._max.percentage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
}

export async function getStudentPerformance(req: Request, res: Response) {
  try {
    const attempts = await prisma.testAttempt.findMany({
      where: { studentId: req.user!.userId, status: 'COMPLETED' },
      include: { test: { include: { subject: true } } },
      orderBy: { submittedAt: 'asc' },
    });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
}

export async function getAdminDashboard(_req: Request, res: Response) {
  try {
    const [totalStudents, totalTests, totalAttempts, avgScore] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.test.count(),
      prisma.testAttempt.count({ where: { status: 'COMPLETED' } }),
      prisma.testAttempt.aggregate({ where: { status: 'COMPLETED' }, _avg: { percentage: true } }),
    ]);
    res.json({ totalStudents, totalTests, totalAttempts, avgPercentage: avgScore._avg.percentage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin dashboard' });
  }
}

export async function getTestAnalytics(req: Request, res: Response) {
  try {
    const testId = req.params.testId;
    const [attempts, avgScore, highScore, lowScore] = await Promise.all([
      prisma.testAttempt.count({ where: { testId, status: 'COMPLETED' } }),
      prisma.testAttempt.aggregate({ where: { testId, status: 'COMPLETED' }, _avg: { score: true, percentage: true } }),
      prisma.testAttempt.aggregate({ where: { testId, status: 'COMPLETED' }, _max: { score: true } }),
      prisma.testAttempt.aggregate({ where: { testId, status: 'COMPLETED' }, _min: { score: true } }),
    ]);
    // Score distribution
    const allAttempts = await prisma.testAttempt.findMany({
      where: { testId, status: 'COMPLETED' },
      select: { score: true, percentage: true, timeTaken: true, studentId: true },
    });

    const distribution = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    let passCount = 0;
    let failCount = 0;
    const test = await prisma.test.findUnique({ where: { id: testId }, select: { passingPercentage: true } });
    const passingPct = test?.passingPercentage || 60;

    for (const a of allAttempts) {
      const pct = a.percentage || 0;
      if (pct <= 20) distribution['0-20']++;
      else if (pct <= 40) distribution['21-40']++;
      else if (pct <= 60) distribution['41-60']++;
      else if (pct <= 80) distribution['61-80']++;
      else distribution['81-100']++;
      if (pct >= passingPct) passCount++; else failCount++;
    }

    // Top 10 scorers
    const topScorers = await prisma.testAttempt.findMany({
      where: { testId, status: 'COMPLETED' },
      include: { student: { select: { fullName: true } } },
      orderBy: [{ score: 'desc' }, { timeTaken: 'asc' }],
      take: 10,
    });

    // Question-wise correct rate
    const testQuestions = await prisma.testQuestion.findMany({
      where: { testId },
      include: { question: { select: { id: true, text: true, correctAnswers: true } } },
    });

    const questionStats = testQuestions.map((tq) => {
      let correctCount = 0;
      for (const a of allAttempts) {
        // We'd need responses here - this is a simplified version
      }
      return {
        questionId: tq.question.id,
        text: tq.question.text.replace(/<[^>]*>/g, '').slice(0, 60),
      };
    });

    res.json({
      totalAttempts: attempts,
      avgScore: avgScore._avg.score ? Math.round(avgScore._avg.score * 100) / 100 : null,
      avgPercentage: avgScore._avg.percentage ? Math.round(avgScore._avg.percentage) : null,
      highestScore: highScore._max.score,
      lowestScore: lowScore._min.score,
      distribution,
      passCount,
      failCount,
      topScorers: topScorers.map((s, i) => ({
        rank: i + 1,
        name: s.student.fullName,
        score: s.score,
        percentage: s.percentage,
        timeTaken: s.timeTaken,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test analytics' });
  }
}

export async function getTestLeaderboard(req: Request, res: Response) {
  try {
    const results = await prisma.testAttempt.findMany({
      where: { testId: req.params.testId, status: 'COMPLETED' },
      include: { student: { select: { fullName: true } } },
      orderBy: [{ score: 'desc' }, { timeTaken: 'asc' }],
      take: 100,
    });
    const leaderboard = results.map((r, i) => ({
      rank: i + 1,
      studentName: r.student.fullName,
      score: r.score,
      percentage: r.percentage,
      timeTaken: r.timeTaken,
    }));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}
