import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { getRedis } from '../config/redis';

const QUEUE_NAME = 'difficulty-calibration';
const prisma = new PrismaClient();

let calibrationQueue: Queue | null = null;

export function getCalibrationQueue(): Queue {
  if (!calibrationQueue) {
    calibrationQueue = new Queue(QUEUE_NAME, { connection: getRedis() });
  }
  return calibrationQueue;
}

export function startCalibrationWorker(): void {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { testId } = job.data;

      // Get all completed attempts for this test
      const attempts = await prisma.testAttempt.findMany({
        where: { testId, status: 'COMPLETED' },
      });

      if (attempts.length < 30) {
        console.log(`Test ${testId}: Only ${attempts.length} attempts, need 30 for calibration`);
        return;
      }

      // TODO: Analyze per-question correct rates and suggest difficulty changes
      // For each question in the test:
      // - Calculate correct answer rate
      // - Calculate average time spent
      // - Suggest new difficulty based on data
      console.log(`Calibration completed for test ${testId}`);
    },
    { connection: getRedis() }
  );

  worker.on('completed', (job) => {
    console.log(`Calibration job ${job.id} completed`);
  });
}
