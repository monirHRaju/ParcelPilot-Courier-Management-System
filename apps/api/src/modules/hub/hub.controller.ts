import { Request, Response, NextFunction } from 'express';
import { hubService } from './hub.service.js';
import { createHubSchema, assignManagerSchema } from './hub.schemas.js';
import { AppError } from '../../errors/app-error.js';

export const hubController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = createHubSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        throw AppError.badRequest(
          'Validation failed',
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }

      const hub = await hubService.createHub(validationResult.data);
      
      res.status(201).json({
        message: 'Hub created successfully',
        hub,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const hubs = await hubService.getAllHubs();
      
      res.status(200).json({
        message: 'Hubs retrieved successfully',
        hubs,
      });
    } catch (error) {
      next(error);
    }
  },

  async assignManager(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validationResult = assignManagerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        throw AppError.badRequest(
          'Validation failed',
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }

      const updatedUser = await hubService.assignManager(id, validationResult.data.userId);

      res.status(200).json({
        message: 'Manager assigned successfully',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
};
