import { Worker, Job } from 'bullmq';
import type { Redis } from 'ioredis';
import { smsProvider } from '../../sms/index.js';
import { logger } from '../../logger.js';

export type SmsJobData = {
  phone: string;
  message: string;
  context?: string; // optional: parcel ID, 'OTP', etc. for logging
};

export class SmsWorker extends Worker {
  constructor(connection: Redis) {
    super(
      'SMS_QUEUE',
      async (job: Job<SmsJobData>) => {
        logger.info(
          { jobId: job.id, attempt: job.attemptsMade + 1, phone: job.data.phone, context: job.data.context },
          '[SMS Worker] Sending SMS'
        );

        await smsProvider.send(job.data.phone, job.data.message);

        logger.info({ jobId: job.id, phone: job.data.phone }, '[SMS Worker] SMS sent successfully');
      },
      { connection }
    );
  }
}
