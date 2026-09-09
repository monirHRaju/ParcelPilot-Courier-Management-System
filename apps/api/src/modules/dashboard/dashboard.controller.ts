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

  static async getHubDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      // Fetch user to get their hubId
      const { prisma } = await import('../../lib/prisma.js');
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      if (!user?.hubId) {
        throw new Error('Hub Manager is not assigned to any hub');
      }

      const stats = await DashboardService.getHubStats(user.hubId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getRiderDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const stats = await DashboardService.getRiderStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}
