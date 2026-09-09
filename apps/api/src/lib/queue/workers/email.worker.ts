import { Worker, Job } from 'bullmq';
import type { Redis } from 'ioredis';
import { emailService, SendEmailOptions } from '../../email/email.service.js';
import { logger } from '../../logger.js';

// Job data type — attachments use base64 strings because BullMQ serializes via JSON
export type EmailJobData = Omit<SendEmailOptions, 'attachments'> & {
  attachments?: Array<{
    filename: string;
    content: string; // base64-encoded string (Buffer is not JSON-serializable)
    contentType: string;
  }>;
};

export class EmailWorker extends Worker {
  constructor(connection: Redis) {
    super(
      'EMAIL_QUEUE',
      async (job: Job<EmailJobData>) => {
        const { to, subject } = job.data;
        logger.info(
          { jobId: job.id, attempt: job.attemptsMade + 1, to, subject },
          '[Email Worker] Sending email'
        );

        await emailService.sendEmail({
          to: job.data.to,
          subject: job.data.subject,
          html: job.data.html,
          attachments: job.data.attachments,
        });

        logger.info({ jobId: job.id, to }, '[Email Worker] Email sent successfully');
      },
      { connection }
    );
  }
}
