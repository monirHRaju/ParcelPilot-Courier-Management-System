import { Request, Response, NextFunction } from 'express';
import { codService } from './cod.service.js';
import { codCollectSchema } from './cod.schemas.js';
import { AppError } from '../../errors/app-error.js';

export const codController = {
  /**
   * POST /parcels/:id/cod-collect — RIDER only
   */
  async collectCod(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: parcelId } = req.params;
      const userId = (req as any).user.id;

      const validationResult = codCollectSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw AppError.badRequest(
          'Validation failed',
          'VALIDATION_ERROR',
          validationResult.error.format(),
        );
      }

      const { amountPaisa, note } = validationResult.data;
      const codCollection = await codService.collectCod(parcelId, userId, amountPaisa, note);

      res.status(201).json({
        success: true,
        data: codCollection,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /riders/me/cod-collections — RIDER only
   */
  async getMyCollections(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const collections = await codService.getRiderCollections(userId);

      res.json({
        success: true,
        data: collections,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /hubs/me/pending-cod — HUB_MANAGER only
   */
  async getPendingCod(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const pendingCollections = await codService.getPendingCodForHub(userId);

      res.json({
        success: true,
        data: pendingCollections,
      });
    } catch (error) {
      next(error);
    }
  },
};
