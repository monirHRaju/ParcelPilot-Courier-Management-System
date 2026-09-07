import { Request, Response, NextFunction } from 'express';
import { pricingService } from './pricing.service.js';
import { estimatePriceSchema } from './pricing.schemas.js';
import { AppError } from '../../errors/app-error.js';

export const pricingController = {
  async estimate(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = estimatePriceSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        throw AppError.badRequest(
          'Validation failed',
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }

      const data = validationResult.data;
      const pricing = pricingService.calculatePrice({
        pickupDistrict: data.pickupAddress.district,
        deliveryDistrict: data.deliveryAddress.district,
        sizeTier: data.sizeTier,
        serviceType: data.serviceType,
        codAmount: data.codAmount,
      });

      res.status(200).json({
        message: 'Price estimate calculated successfully',
        pricing,
      });
    } catch (error) {
      next(error);
    }
  }
};
