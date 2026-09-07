import { Request, Response, NextFunction } from 'express';
import { parcelService } from './parcel.service.js';
import { createParcelSchema, transitionStatusSchema } from './parcel.schemas.js';
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
  },

  async transitionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const validationResult = transitionStatusSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw AppError.badRequest(
          'Validation failed',
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }

      const { status, note } = validationResult.data;
      const result = await parcelService.transitionParcelStatus(id, status, user.id, note);

      res.status(200).json({
        message: 'Parcel status updated successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const history = await parcelService.getParcelHistory(id, user);

      res.status(200).json({
        message: 'Parcel history retrieved successfully',
        history,
      });
    } catch (error) {
      next(error);
    }
  }
};
