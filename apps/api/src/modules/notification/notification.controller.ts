import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service.js';

export const notificationController = {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await notificationService.getMyNotifications(userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;
      const result = await notificationService.getUnreadCount(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user!.id;
      const notification = await notificationService.markAsRead(id, userId);
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;
      const result = await notificationService.markAllAsRead(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
