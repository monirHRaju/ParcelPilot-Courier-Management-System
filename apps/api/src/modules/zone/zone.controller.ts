import { Request, Response, NextFunction } from 'express';
import { zoneService } from './zone.service.js';
import { createZoneSchema } from './zone.schemas.js';
import { AppError } from '../../errors/app-error.js';

export const zoneController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = createZoneSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        throw AppError.badRequest(
          'Validation failed',
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }

      const zone = await zoneService.createZone(validationResult.data);
      
      res.status(201).json({
        message: 'Zone mapping created successfully',
        zone,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const zones = await zoneService.getAllZones();
      
      res.status(200).json({
        message: 'Zones retrieved successfully',
        zones,
      });
    } catch (error) {
      next(error);
    }
  }
};
