import { Request, Response, NextFunction } from 'express';
import { reconciliationService } from './reconciliation.service.js';
import { addReconciliationItemSchema } from './reconciliation.schemas.js';
import { AppError } from '../../errors/app-error.js';
import { prisma } from '../../lib/prisma.js';

export const reconciliationController = {
  async createOrGet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.hubId) {
        throw AppError.forbidden('You are not assigned to a hub', 'NO_HUB_ASSIGNMENT');
      }

      const reconciliation = await reconciliationService.createOrGetReconciliation(user.hubId);
      res.json({ success: true, data: reconciliation });
    } catch (error) {
      next(error);
    }
  },

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.hubId) {
        throw AppError.forbidden('You are not assigned to a hub', 'NO_HUB_ASSIGNMENT');
      }

      const validationResult = addReconciliationItemSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw AppError.badRequest('Validation failed', 'VALIDATION_ERROR', validationResult.error.format());
      }

      const item = await reconciliationService.addItem(id, user.hubId, validationResult.data);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async close(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.hubId) {
        throw AppError.forbidden('You are not assigned to a hub', 'NO_HUB_ASSIGNMENT');
      }

      const reconciliation = await reconciliationService.closeReconciliation(id, userId, user.hubId);
      res.json({ success: true, data: reconciliation });
    } catch (error) {
      next(error);
    }
  },

  async getMyReconciliations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.hubId) {
        throw AppError.forbidden('You are not assigned to a hub', 'NO_HUB_ASSIGNMENT');
      }

      const reconciliations = await reconciliationService.getMyHubReconciliations(user.hubId);
      res.json({ success: true, data: reconciliations });
    } catch (error) {
      next(error);
    }
  },

  async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.hubId) {
        throw AppError.forbidden('You are not assigned to a hub', 'NO_HUB_ASSIGNMENT');
      }

      const reconciliation = await reconciliationService.getReconciliationDetail(id, user.hubId);
      res.json({ success: true, data: reconciliation });
    } catch (error) {
      next(error);
    }
  },
};
