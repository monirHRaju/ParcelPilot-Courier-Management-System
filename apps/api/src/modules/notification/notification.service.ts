import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';

export const notificationService = {
  async getMyNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
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

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  },
};
