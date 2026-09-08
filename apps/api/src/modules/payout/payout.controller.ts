import { Request, Response, NextFunction } from 'express';
import { payoutService } from './payout.service.js';
import { updatePayoutSchema } from './payout.schemas.js';
import { AppError } from '../../errors/app-error.js';

export const payoutController = {
  // Merchant endpoints
  async requestPayout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const payout = await payoutService.requestPayout(userId);
      res.status(201).json({ success: true, data: payout });
    } catch (error) {
      next(error);
    }
  },

  async getMyPayouts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const payouts = await payoutService.getMyPayouts(userId);
      res.json({ success: true, data: payouts });
    } catch (error) {
      next(error);
    }
  },

  // Admin endpoints
  async getAdminPayouts(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const payouts = await payoutService.getAdminPayouts(status as string);
      res.json({ success: true, data: payouts });
    } catch (error) {
      next(error);
    }
  },

  async updateAdminPayout(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validationResult = updatePayoutSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        throw AppError.badRequest('Validation failed', 'VALIDATION_ERROR', validationResult.error.format());
      }

      const payout = await payoutService.updateAdminPayout(id, validationResult.data);
      res.json({ success: true, data: payout });
    } catch (error) {
      next(error);
    }
  },
};
