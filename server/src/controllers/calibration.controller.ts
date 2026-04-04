import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function calibrateTest(req: Request, res: Response) {
  try {
    const { testId } = req.params;

    const attempts = await prisma.testAttempt.findMany({
      where: { testId, status: 'COMPLETED' },
    });

    if (attempts.length < 30) {
      res.json({
        message: `Need at least 30 attempts for calibration (currently ${attempts.length})`,
        suggestions: [],
      });
      return;
    }

    // Get test questions
    const testQuestions = await prisma.testQuestion.findMany({
      where: { testId },
      include: { question: true },
    });

    const suggestions: any[] = [];

    for (const tq of testQuestions) {
      const q = tq.question;
      let correctCount = 0;

      for (const attempt of attempts) {
        const responses = attempt.responses ? JSON.parse(attempt.responses) : {};
        const studentAnswer = responses[q.id];
        const correctAnswers = q.correctAnswers as string[];

        if (studentAnswer && correctAnswers.includes(studentAnswer)) {
          correctCount++;
        }
      }

      const correctRate = correctCount / attempts.length;
      let suggestedDifficulty: string;

      if (correctRate > 0.85) suggestedDifficulty = 'SIMPLE';
      else if (correctRate > 0.60) suggestedDifficulty = 'MODERATE';
      else if (correctRate > 0.35) suggestedDifficulty = 'HARD';
      else suggestedDifficulty = 'VERY_HARD';

      if (suggestedDifficulty !== q.difficulty) {
        suggestions.push({
          questionId: q.id,
          questionText: q.text.replace(/<[^>]*>/g, '').slice(0, 100),
          currentDifficulty: q.difficulty,
          suggestedDifficulty,
          correctRate: Math.round(correctRate * 100),
          totalAttempts: attempts.length,
        });
      }
    }

    res.json({ suggestions, totalQuestions: testQuestions.length, totalAttempts: attempts.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calibrate' });
  }
}

export async function applyCalibration(req: Request, res: Response) {
  try {
    const { calibrations } = req.body;
    // calibrations: [{ questionId, newDifficulty }]

    let updated = 0;
    for (const cal of calibrations) {
      await prisma.question.update({
        where: { id: cal.questionId },
        data: { difficulty: cal.newDifficulty },
      });
      updated++;
    }

    res.json({ message: `${updated} questions calibrated`, updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply calibration' });
  }
}
