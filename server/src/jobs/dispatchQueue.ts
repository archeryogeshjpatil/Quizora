import { Queue, Worker } from 'bullmq';
import { getRedis } from '../config/redis';
import { emailService } from '../services/messaging/email';
import { telegramService } from '../services/messaging/telegram';
import { whatsappService } from '../services/messaging/whatsapp';

const QUEUE_NAME = 'result-dispatch';

let dispatchQueue: Queue | null = null;

export function getDispatchQueue(): Queue {
  if (!dispatchQueue) {
    dispatchQueue = new Queue(QUEUE_NAME, { connection: getRedis() });
  }
  return dispatchQueue;
}

export function startDispatchWorker(): void {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { channel, recipient, data } = job.data;

      switch (channel) {
        case 'EMAIL':
          await emailService.sendResult(recipient.email, data);
          break;
        case 'TELEGRAM':
          if (recipient.telegramChatId) {
            await telegramService.sendResult(recipient.telegramChatId, data);
          }
          break;
        case 'WHATSAPP':
          await whatsappService.sendResult(recipient.mobile, data);
          break;
      }
    },
    { connection: getRedis() }
  );

  worker.on('completed', (job) => {
    console.log(`Dispatch job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Dispatch job ${job?.id} failed:`, err.message);
  });
}

export async function scheduleDispatch(dispatchData: {
  channel: string;
  recipient: { email: string; mobile: string; telegramChatId?: string };
  data: any;
  delay?: number; // milliseconds
}): Promise<void> {
  const queue = getDispatchQueue();
  await queue.add('dispatch', dispatchData, {
    delay: dispatchData.delay || 0,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
}
