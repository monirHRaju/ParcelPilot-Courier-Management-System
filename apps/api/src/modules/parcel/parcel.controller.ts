import { Request, Response, NextFunction } from 'express';
import { parcelService } from './parcel.service.js';
import { createParcelSchema } from './parcel.schemas.js';
import { AppError } from '../../errors/app-error.js';

export const parcelController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      
      const validationResult = createParcelSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw AppError.badRequest(
          'Validation failed',
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }

      const parcel = await parcelService.createParcel(user.id, validationResult.data);
      
      res.status(201).json({
        message: 'Parcel created successfully',
        parcel,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const parcels = await parcelService.getMyParcels(user.id);
      
      res.status(200).json({
        message: 'Parcels retrieved successfully',
        parcels,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      
      const parcel = await parcelService.getParcelById(id, user);
      
      res.status(200).json({
        message: 'Parcel retrieved successfully',
        parcel,
      });
    } catch (error) {
      next(error);
    }
  }
};
