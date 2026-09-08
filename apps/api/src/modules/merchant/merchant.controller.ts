import { Request, Response, NextFunction } from 'express';
import { merchantService } from './merchant.service.js';
import { onboardMerchantSchema } from './merchant.schemas.js';
import { AppError } from '../../errors/app-error.js';

export const merchantController = {
  async onboard(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      
      const validationResult = onboardMerchantSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw AppError.badRequest(
          'Validation failed',
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }

      const merchant = await merchantService.onboardMerchant(user.id, validationResult.data);
      
      res.status(201).json({
        message: 'Merchant profile created successfully',
        merchant,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const merchant = await merchantService.getMyProfile(user.id);
      
      res.status(200).json({
        message: 'Merchant profile retrieved successfully',
        merchant,
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePayoutMethod(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { updatePayoutMethodSchema } = await import('./merchant.schemas.js');
      const validationResult = updatePayoutMethodSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        throw AppError.badRequest('Validation failed', 'VALIDATION_ERROR', validationResult.error.format());
      }

      const merchant = await merchantService.updatePayoutMethod(user.id, validationResult.data.payoutMethod);
      
      res.status(200).json({
        success: true,
        message: 'Payout method updated successfully',
        data: merchant,
      });
    } catch (error) {
      next(error);
    }
  },
};
