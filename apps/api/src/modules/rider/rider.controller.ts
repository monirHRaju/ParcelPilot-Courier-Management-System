import { Request, Response, NextFunction } from 'express';
import { riderService } from './rider.service.js';
import { onboardRiderSchema, approveRiderSchema, updateLocationSchema } from './rider.schemas.js';
import { AppError } from '../../errors/app-error.js';

export const riderController = {
  async onboard(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      
      const validationResult = onboardRiderSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw AppError.badRequest(
          'Validation failed',
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }

      const rider = await riderService.onboardRider(user.id, validationResult.data);
      
      res.status(201).json({
        message: 'Rider onboarded successfully',
        rider,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const rider = await riderService.getMyProfile(user.id);
      
      res.status(200).json({
        message: 'Rider profile retrieved successfully',
        rider,
      });
    } catch (error) {
      next(error);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validationResult = approveRiderSchema.safeParse({ id, ...req.body });

      if (!validationResult.success) {
        throw AppError.badRequest(
          'Validation failed',
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }

      const rider = await riderService.approveRider(validationResult.data.id, validationResult.data.hubId);
      
      res.status(200).json({
        message: 'Rider approved successfully',
        rider,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      
      const validationResult = updateLocationSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw AppError.badRequest(
          'Validation failed',
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }

      await riderService.updateLocation(user.id, validationResult.data.latitude, validationResult.data.longitude);
      
      res.status(200).json({
        message: 'Location updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
};
