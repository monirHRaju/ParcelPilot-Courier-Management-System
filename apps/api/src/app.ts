import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './modules/health/health.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { authenticate } from './middleware/authenticate.js';
import { authorize } from './middleware/authorize.js';
import { AppError } from './errors/app-error.js';
import { ParcelSchema, Parcel, createPlaceholderParcel } from '@courier/shared';
import { Role } from '@prisma/client';

export const createApp = (): Express => {
  const app = express();

  // Security and core middleware
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Health check routes (controller -> service -> repository)
  app.use('/health', healthRouter);

  // Auth routes
  app.use('/auth', authRouter);

  // Protected test routes
  app.get('/api/protected/any', authenticate, (req: Request, res: Response) => {
    res.json({
      message: 'You have accessed a protected route available to any authenticated user!',
      user: (req as any).user,
    });
  });

  app.get('/api/protected/admin', authenticate, authorize(Role.SUPER_ADMIN), (req: Request, res: Response) => {
    res.json({
      message: 'You have accessed a protected route for SUPER_ADMIN only!',
      user: (req as any).user,
    });
  });

  // Sample route using shared Zod schema & types
  app.get('/api/parcels/sample', (_req: Request, res: Response) => {
    const sampleParcel: Parcel = createPlaceholderParcel();
    const validationResult = ParcelSchema.safeParse(sampleParcel);

    if (!validationResult.success) {
      throw AppError.badRequest(
        'Invalid parcel schema',
        'SCHEMA_VALIDATION_FAILED',
        validationResult.error.format()
      );
    }

    res.json({
      message: 'Sample parcel fetched successfully',
      parcel: validationResult.data,
    });
  });

  // 404 handler for unmatched routes
  app.use((req: Request, _res: Response) => {
    throw AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND');
  });

  // Centralized error handler (must be last)
  app.use(errorHandler);

  return app;
};

export const app = createApp();
