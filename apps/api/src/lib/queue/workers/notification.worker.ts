import { Worker, Job } from 'bullmq';
import type { Redis } from 'ioredis';
import { prisma } from '../../prisma.js';
import { logger } from '../../logger.js';

export type NotificationJobData = {
  userId: string;
  type: string;
  message: string;
  parcelId?: string;
};

export class NotificationWorker extends Worker {
  constructor(connection: Redis) {
    super(
      'NOTIFICATION_QUEUE',
      async (job: Job<NotificationJobData>) => {
        const { userId, type, message, parcelId } = job.data;

        logger.info({ jobId: job.id, userId, type }, '[Notification Worker] Creating in-app notification');

        // 1. Persist the notification to the database (durable)
        const notification = await prisma.notification.create({
          data: { userId, type, message, parcelId },
        });

        // 2. Push the notification live via Socket.IO (best-effort)
        // If the user isn't connected, this is a no-op — the notification
        // is still persisted and will appear when they next check.
        try {
          const { getIO } = await import('../../socket.js');
          const io = getIO();
          io.to(`user:${userId}`).emit('notification:new', {
            id: notification.id,
            type: notification.type,
            message: notification.message,
            parcelId: notification.parcelId,
            createdAt: notification.createdAt,
          });
        } catch (err) {
          // Socket.IO may not be initialized in test environments — log and continue.
          // The DB write is the durable part; the socket push is supplementary.
          logger.warn({ err, jobId: job.id, userId }, '[Notification Worker] Socket push failed (non-fatal)');
        }

        logger.info(
          { jobId: job.id, notificationId: notification.id, userId },
          '[Notification Worker] Notification created and pushed'
        );
      },
      { connection }
    );
  }
}
