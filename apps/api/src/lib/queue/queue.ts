import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../../config/env.js';
import { logger } from '../logger.js';

// BullMQ requires its own dedicated ioredis connection(s),
// separate from the connections used by the Socket.IO Redis adapter.
export const queueRedis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  lazyConnect: true,
});

queueRedis.on('connect', () => {
  logger.info('[Queue] Redis connection established');
});

queueRedis.on('error', (err) => {
  logger.error({ err }, '[Queue] Redis connection error');
});

const defaultJobOptions = {
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: { count: 500 }, // Keep last 500 completed jobs for inspection
  removeOnFail: false, // Keep ALL failed jobs — dead-letter for investigation
};

// SMS queue: outbound SMS messages (OTP, status updates)
export const smsQueue = new Queue('SMS_QUEUE', {
  connection: queueRedis,
  defaultJobOptions,
});

// In-app notification queue: creates Notification rows + socket push
export const notificationQueue = new Queue('NOTIFICATION_QUEUE', {
  connection: queueRedis,
  defaultJobOptions,
});

// Email queue: transactional emails (payout confirmations, dispute alerts)
export const emailQueue = new Queue('EMAIL_QUEUE', {
  connection: queueRedis,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 5,
    backoff: { type: 'exponential' as const, delay: 3000 },
    removeOnComplete: { count: 200 },
  },
});

logger.info('[Queue] SMS_QUEUE, NOTIFICATION_QUEUE, EMAIL_QUEUE initialized');
