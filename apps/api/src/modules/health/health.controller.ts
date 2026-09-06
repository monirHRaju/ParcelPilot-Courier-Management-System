import { Request, Response, NextFunction } from 'express';
import { healthService, HealthService } from './health.service.js';
import { AppError } from '../../errors/app-error.js';

export class HealthController {
  constructor(private readonly service: HealthService = healthService) {}

  getHealth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getHealthStatus();
      const statusCode = result.status === 'ok' ? 200 : 503;
      res.status(statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  triggerTestError = (req: Request, _res: Response, _next: NextFunction): void => {
    const type = req.query.type as string;

    if (type === 'not_found') {
      throw AppError.notFound('Requested resource does not exist', 'NOT_FOUND');
    }

    if (type === 'conflict') {
      throw AppError.conflict('Resource already exists', 'RESOURCE_CONFLICT', {
        field: 'trackingNumber',
      });
    }

    throw AppError.badRequest('Sample operational validation error', 'INVALID_PAYLOAD', {
      example: 'Invalid tracking ID format',
    });
  };
}

export const healthController = new HealthController();
