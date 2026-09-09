import { Worker } from 'bullmq';
import { queueRedis } from '../queue.js';
import { SmsWorker } from './sms.worker.js';
import { NotificationWorker } from './notification.worker.js';
import { EmailWorker } from './email.worker.js';
import { logger } from '../../logger.js';

let workers: Worker[] = [];

/**
 * Attaches standard error/failure logging to a worker.
 * BullMQ handles retries automatically — these handlers are for observability only.
 */
function attachErrorHandlers(worker: Worker): void {
  worker.on('failed', (job, err) => {
    logger.error(
      { jobId: job?.id, queue: worker.name, attempt: job?.attemptsMade, err },
      `[${worker.name}] Job failed`
    );
  });

  worker.on('error', (err) => {
    logger.error({ queue: worker.name, err }, `[${worker.name}] Worker error`);
  });

  worker.on('completed', (job) => {
    logger.debug({ jobId: job.id, queue: worker.name }, `[${worker.name}] Job completed`);
  });
}

/**
 * Starts all BullMQ workers. Call once from server.ts after the HTTP server starts.
 */
export function startWorkers(): void {
  const smsWorker = new SmsWorker(queueRedis);
  const notificationWorker = new NotificationWorker(queueRedis);
  const emailWorker = new EmailWorker(queueRedis);

  workers = [smsWorker, notificationWorker, emailWorker];
  workers.forEach(attachErrorHandlers);

  logger.info('[BullMQ] Worker pool started: SMS_QUEUE, NOTIFICATION_QUEUE, EMAIL_QUEUE');
}

/**
 * Gracefully closes all workers. Call from the graceful shutdown handler in server.ts.
 * Workers finish processing any in-progress jobs before closing.
 */
export async function closeWorkers(): Promise<void> {
  if (workers.length === 0) return;
  await Promise.all(workers.map((w) => w.close()));
  logger.info('[BullMQ] All workers closed gracefully');
}
