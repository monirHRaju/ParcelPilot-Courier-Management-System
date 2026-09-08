import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';

export const notificationService = {
  async getMyNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw AppError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
    }

    if (notification.userId !== userId) {
      throw AppError.forbidden('You can only update your own notifications', 'FORBIDDEN');
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },
};
