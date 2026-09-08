import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service.js';

export const notificationController = {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;
      const notifications = await notificationService.getMyNotifications(userId);
      res.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user!.id;
      
      const notification = await notificationService.markAsRead(id, userId);
      
      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  },
};
