import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';

export class DashboardController {
  static async getAdminDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getAdminStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getMerchantDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const stats = await DashboardService.getMerchantStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}
