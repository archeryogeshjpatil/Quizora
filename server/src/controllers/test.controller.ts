import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { notifications } from '../utils/notify';

const prisma = new PrismaClient();

export async function getAllTests(req: Request, res: Response) {
  try {
    const tests = await prisma.test.findMany({
      include: { subject: true, topic: true, batches: { include: { batch: { select: { id: true, name: true } } } }, _count: { select: { questions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: {
        subject: true,
        topic: true,
        questions: {
          include: { question: { include: { options: true, topic: true } } },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (!test) { res.status(404).json({ error: 'Test not found' }); return; }
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test' });
  }
}

export async function getAvailableTests(req: Request, res: Response) {
  try {
    const now = new Date();
    const studentId = req.user!.userId;

    // Find batches this student belongs to
    const studentBatches = await prisma.batchStudent.findMany({
      where: { studentId },
      select: { batchId: true },
    });
    const batchIds = studentBatches.map((b) => b.batchId);

    // Find test IDs assigned to those batches
    const batchTestIds = batchIds.length > 0
      ? (await prisma.batchTest.findMany({
          where: { batchId: { in: batchIds } },
          select: { testId: true },
        })).map((bt) => bt.testId)
      : [];

    // Only show tests assigned to student's batches
    if (batchTestIds.length === 0) {
      res.json([]);
      return;
    }

    const tests = await prisma.test.findMany({
      where: {
        id: { in: batchTestIds },
        status: 'PUBLISHED',
        OR: [
          { startDate: null },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      include: { subject: true, topic: true, _count: { select: { questions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available tests' });
  }
}

export async function getPreTestInfo(req: Request, res: Response) {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, title: true, type: true, instructions: true, duration: true,
        isTimeBased: true, totalMarks: true, webcamProctoring: true,
        subject: { select: { name: true } },
        _count: { select: { questions: true } },
      },
    });
    if (!test) { res.status(404).json({ error: 'Test not found' }); return; }

    const attemptCount = await prisma.testAttempt.count({
      where: { testId: req.params.id, studentId: req.user!.userId },
    });

    res.json({ ...test, attemptNumber: attemptCount + 1 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test info' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { questionIds, batchIds, ...testData } = req.body;
    const test = await prisma.test.create({
      data: {
        ...testData,
        status: 'PUBLISHED',
        questions: questionIds ? {
          create: questionIds.map((qId: string, index: number) => ({
            questionId: qId,
            orderIndex: index + 1,
          })),
        } : undefined,
        batches: batchIds && batchIds.length > 0 ? {
          create: batchIds.map((bId: string) => ({ batchId: bId })),
        } : undefined,
      },
      include: { questions: true, subject: true, topic: true, batches: { include: { batch: true } } },
    });
    res.status(201).json(test);
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { questionIds, batchIds, ...testData } = req.body;

    // If questionIds provided, replace all test questions
    if (questionIds) {
      await prisma.testQuestion.deleteMany({ where: { testId: req.params.id } });
      await prisma.testQuestion.createMany({
        data: questionIds.map((qId: string, index: number) => ({
          testId: req.params.id,
          questionId: qId,
          orderIndex: index + 1,
        })),
      });
    }

    // If batchIds provided, replace all batch assignments
    if (batchIds !== undefined) {
      await prisma.batchTest.deleteMany({ where: { testId: req.params.id } });
      if (batchIds.length > 0) {
        await prisma.batchTest.createMany({
          data: batchIds.map((bId: string) => ({ testId: req.params.id, batchId: bId })),
        });
      }
    }

    const test = await prisma.test.update({
      where: { id: req.params.id },
      data: testData,
      include: { subject: true, topic: true, questions: { include: { question: true } }, batches: { include: { batch: true } } },
    });
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update test' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await prisma.testQuestion.deleteMany({ where: { testId: req.params.id } });
    await prisma.test.delete({ where: { id: req.params.id } });
    res.json({ message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete test' });
  }
}

// Get which tests a question is used in
export async function getQuestionUsage(req: Request, res: Response) {
  try {
    const questionIds = req.body.questionIds as string[];
    const usage = await prisma.testQuestion.findMany({
      where: { questionId: { in: questionIds } },
      include: { test: { select: { id: true, title: true } } },
    });

    // Group by questionId
    const usageMap: Record<string, { testId: string; testTitle: string }[]> = {};
    for (const u of usage) {
      if (!usageMap[u.questionId]) usageMap[u.questionId] = [];
      usageMap[u.questionId].push({ testId: u.test.id, testTitle: u.test.title });
    }
    res.json(usageMap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch question usage' });
  }
}

// Auto-create test
export async function autoCreate(req: Request, res: Response) {
  try {
    const {
      title, subjectId, topicId, type, count, difficulty, questionType,
      includeUsedQuestions, instructions, isTimeBased, duration, negativeMarking,
      negativeMarksValue, marksPerQuestion, batchIds,
    } = req.body;

    // Build question filter
    const where: any = { subjectId };
    if (topicId) where.topicId = topicId;
    if (difficulty && difficulty !== 'MIXED') where.difficulty = difficulty;
    if (questionType && questionType !== 'MIXED') where.type = questionType;

    // Exclude questions already in tests if requested
    if (!includeUsedQuestions) {
      const usedQuestionIds = await prisma.testQuestion.findMany({
        select: { questionId: true },
        distinct: ['questionId'],
      });
      const usedIds = usedQuestionIds.map((u) => u.questionId);
      if (usedIds.length > 0) {
        where.id = { notIn: usedIds };
      }
    }

    // Fetch eligible questions
    const allQuestions = await prisma.question.findMany({ where, select: { id: true, marks: true } });

    if (allQuestions.length === 0) {
      res.status(400).json({ error: 'No questions found matching the selected criteria' });
      return;
    }

    // Randomly select the requested count
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    const totalMarks = selected.reduce((sum, q) => sum + (marksPerQuestion || q.marks), 0);

    const test = await prisma.test.create({
      data: {
        title,
        subjectId,
        topicId: topicId || null,
        type: type || 'OFFICIAL',
        status: 'PUBLISHED',
        instructions: instructions || '',
        isTimeBased: isTimeBased ?? true,
        duration: duration || 30,
        autoSubmitOnTimeout: true,
        marksPerQuestion: marksPerQuestion || 1,
        negativeMarking: negativeMarking || false,
        negativeMarksValue: negativeMarksValue || 0,
        questionsPerPage: 1,
        allowReview: true,
        showResultImmediately: true,
        totalMarks,
        questions: {
          create: selected.map((q, i) => ({
            questionId: q.id,
            orderIndex: i + 1,
          })),
        },
        batches: batchIds && batchIds.length > 0 ? {
          create: batchIds.map((bId: string) => ({ batchId: bId })),
        } : undefined,
      },
      include: { subject: true, topic: true, _count: { select: { questions: true } } },
    });

    res.status(201).json({
      test,
      message: `Test created with ${selected.length} questions (${allQuestions.length} were eligible)`,
    });
  } catch (error) {
    console.error('Auto create test error:', error);
    res.status(500).json({ error: 'Failed to auto-create test' });
  }
}

export async function startTest(req: Request, res: Response) {
  try {
    const test = await prisma.test.findUnique({ where: { id: req.params.id } });
    if (!test) { res.status(404).json({ error: 'Test not found' }); return; }

    // Check attempt limit
    if (test.attemptLimit) {
      const attemptCount = await prisma.testAttempt.count({
        where: { testId: req.params.id, studentId: req.user!.userId },
      });
      if (attemptCount >= test.attemptLimit) {
        res.status(400).json({ error: `Maximum ${test.attemptLimit} attempt(s) allowed` });
        return;
      }
    }

    // Check scheduling window
    const now = new Date();
    if (test.startDate && now < test.startDate) {
      res.status(400).json({ error: 'Test has not started yet' }); return;
    }
    if (test.endDate && now > test.endDate) {
      res.status(400).json({ error: 'Test has ended' }); return;
    }

    const attempt = await prisma.testAttempt.create({
      data: {
        testId: req.params.id,
        studentId: req.user!.userId,
        startedAt: new Date(),
        status: 'IN_PROGRESS',
      },
    });

    const testQuestions = await prisma.testQuestion.findMany({
      where: { testId: req.params.id },
      include: {
        question: {
          include: { options: true },
          // Don't expose correct answers during the test
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    // Strip correct answers from response
    const sanitized = testQuestions.map((tq) => ({
      ...tq,
      question: {
        ...tq.question,
        correctAnswers: undefined, // hide during test
        explanation: undefined,
      },
    }));

    res.json({
      attemptId: attempt.id,
      questions: sanitized,
      test: {
        title: test.title,
        isTimeBased: test.isTimeBased,
        duration: test.duration,
        autoSubmitOnTimeout: test.autoSubmitOnTimeout,
        questionsPerPage: test.questionsPerPage,
        allowReview: test.allowReview,
        tabSwitchPrevention: test.tabSwitchPrevention,
        tabSwitchAction: test.tabSwitchAction,
        maxTabSwitches: test.maxTabSwitches,
        negativeMarking: test.negativeMarking,
        negativeMarksValue: test.negativeMarksValue,
        webcamProctoring: test.webcamProctoring,
      },
    });
  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({ error: 'Failed to start test' });
  }
}

export async function submitTest(req: Request, res: Response) {
  try {
    const { attemptId, responses } = req.body;
    // responses: { questionId: "selectedOptionLabel" } e.g. { "q1": "B", "q2": "A,C" }

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            questions: {
              include: { question: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!attempt) { res.status(404).json({ error: 'Attempt not found' }); return; }
    if (attempt.status !== 'IN_PROGRESS') { res.status(400).json({ error: 'Test already submitted' }); return; }

    const test = attempt.test;
    let score = 0;
    let totalMarks = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    for (const tq of test.questions) {
      const question = tq.question;
      const qMarks = tq.marksOverride || question.marks;
      totalMarks += qMarks;

      const studentAnswer = responses?.[question.id];
      if (!studentAnswer) {
        unattempted++;
        continue;
      }

      const correctAnswers = question.correctAnswers as string[];
      const studentAnswers = studentAnswer.split(',').map((a: string) => a.trim());

      // Check correctness based on question type
      let isCorrect = false;

      if (question.type === 'MCQ' || question.type === 'TRUE_FALSE' || question.type === 'ASSERTION_REASONING') {
        isCorrect = studentAnswers.length === 1 && correctAnswers.includes(studentAnswers[0]);
      } else if (question.type === 'MSQ') {
        const allCorrect = correctAnswers.every((a) => studentAnswers.includes(a));
        const noWrong = studentAnswers.every((a: string) => correctAnswers.includes(a));
        isCorrect = allCorrect && noWrong;
        // Partial marking for MSQ if enabled
        if (!isCorrect && test.msmPartialMarking && noWrong) {
          const partialScore = (studentAnswers.length / correctAnswers.length) * qMarks;
          score += partialScore;
          correct++; // count as partially correct
          continue;
        }
      } else if (question.type === 'MATCHING') {
        isCorrect = JSON.stringify(studentAnswers.sort()) === JSON.stringify(correctAnswers.sort());
      }

      if (isCorrect) {
        score += qMarks;
        correct++;
      } else {
        incorrect++;
        if (test.negativeMarking) {
          score -= test.negativeMarksValue;
        }
      }
    }

    score = Math.max(0, score); // Don't go below 0
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100 * 100) / 100 : 0;
    const timeTaken = Math.round((new Date().getTime() - attempt.startedAt.getTime()) / 1000);

    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        submittedAt: new Date(),
        responses: JSON.stringify(responses),
        score,
        totalMarks,
        percentage,
        timeTaken,
      },
    });

    const result: any = {
      message: 'Test submitted successfully',
      attemptId,
      score,
      totalMarks,
      percentage,
      timeTaken,
      correct,
      incorrect,
      unattempted,
    };

    // If show result immediately
    if (test.showResultImmediately) {
      result.showResult = true;
      // Check passing
      if (test.passingPercentage) {
        result.passed = percentage >= test.passingPercentage;
        result.passingPercentage = test.passingPercentage;
      }
    } else {
      result.showResult = false;
      result.message = 'Test submitted. Results will be published by admin.';
    }

    res.json(result);
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
}

export async function autoSaveResponses(req: Request, res: Response) {
  try {
    const { attemptId, responses } = req.body;
    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: { responses: JSON.stringify(responses) },
    });
    res.json({ message: 'Responses saved' });
  } catch (error) {
    res.status(500).json({ error: 'Auto-save failed' });
  }
}

export async function getTestReview(req: Request, res: Response) {
  try {
    const { attemptId } = req.query;
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId as string },
      include: {
        test: {
          include: {
            subject: true,
            questions: {
              include: { question: { include: { options: true } } },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!attempt) { res.status(404).json({ error: 'Attempt not found' }); return; }
    if (attempt.studentId !== req.user!.userId) { res.status(403).json({ error: 'Not your attempt' }); return; }
    if (attempt.status !== 'COMPLETED') { res.status(400).json({ error: 'Test not yet submitted' }); return; }

    // Check if results are visible
    if (!attempt.test.showResultImmediately && !attempt.test.resultsPublished) {
      res.status(403).json({ error: 'Results not yet published' }); return;
    }

    const responses = attempt.responses ? JSON.parse(attempt.responses) : {};
    const review = attempt.test.questions.map((tq) => {
      const q = tq.question;
      const studentAnswer = responses[q.id] || null;
      const correctAnswers = q.correctAnswers as string[];

      return {
        questionId: q.id,
        text: q.text,
        type: q.type,
        difficulty: q.difficulty,
        marks: tq.marksOverride || q.marks,
        options: q.options,
        correctAnswers,
        studentAnswer,
        isCorrect: studentAnswer
          ? q.type === 'MSQ'
            ? JSON.stringify(studentAnswer.split(',').sort()) === JSON.stringify(correctAnswers.sort())
            : correctAnswers.includes(studentAnswer)
          : false,
        explanation: q.explanation,
      };
    });

    res.json({
      test: { title: attempt.test.title, subject: attempt.test.subject?.name },
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      timeTaken: attempt.timeTaken,
      review,
    });
  } catch (error) {
    console.error('Test review error:', error);
    res.status(500).json({ error: 'Failed to load test review' });
  }
}

export async function publishResults(req: Request, res: Response) {
  try {
    await prisma.test.update({
      where: { id: req.params.id },
      data: { resultsPublished: true },
    });
    res.json({ message: 'Results published' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish results' });
  }
}
