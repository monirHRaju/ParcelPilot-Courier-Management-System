import { Request, Response, NextFunction } from 'express';
import { parse } from 'csv-parse/sync';
import { parcelService } from './parcel.service.js';
import { createParcelSchema, transitionStatusSchema } from './parcel.schemas.js';
import { AppError } from '../../errors/app-error.js';

export const parcelController = {
  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      
      if (!req.file) {
        throw AppError.badRequest('CSV file is required', 'FILE_REQUIRED');
      }

      const fileBuffer = req.file.buffer;
      const records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
      });

      if (records.length > 500) {
        throw AppError.badRequest('Upload limit exceeded (max 500 rows)', 'LIMIT_EXCEEDED');
      }

      const results: { row: number, success: boolean, parcelId?: string, error?: string }[] = [];
      const validRows: { originalIndex: number, data: any }[] = [];

      records.forEach((record: any, index: number) => {
        const mappedData = {
          recipientName: record.recipientName,
          recipientPhone: record.recipientPhone,
          weightGrams: record.weightGrams ? Number(record.weightGrams) : undefined,
          sizeTier: record.sizeTier,
          codAmount: record.codAmount ? Number(record.codAmount) : undefined,
          serviceType: record.serviceType,
          pickupAddress: {
            division: 'N/A', // CSV doesn't specify pickup address
            district: 'N/A',
            upazilaOrThana: 'N/A',
            area: 'N/A',
            addressLine: 'Default merchant pickup location',
          },
          deliveryAddress: {
            division: record.division,
            district: record.district,
            upazilaOrThana: record.upazilaOrThana,
            area: record.area,
            addressLine: record.addressLine,
          }
        };

        const validationResult = createParcelSchema.safeParse(mappedData);

        if (!validationResult.success) {
          results.push({
            row: index + 1,
            success: false,
            error: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
          });
        } else {
          validRows.push({ originalIndex: index + 1, data: validationResult.data });
        }
      });

      if (validRows.length > 0) {
        const createdResults = await parcelService.createBulkParcels(user.id, validRows);
        results.push(...createdResults);
      }

      results.sort((a, b) => a.row - b.row);

      res.status(200).json({
        message: 'Bulk parcel creation processed',
        results,
      });
    } catch (error) {
      next(error);
    }
  },

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
