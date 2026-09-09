import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './modules/health/health.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { merchantRouter } from './modules/merchant/merchant.routes.js';
import { riderRouter } from './modules/rider/rider.routes.js';
import { parcelRouter } from './modules/parcel/parcel.routes.js';
import { pricingRouter } from './modules/pricing/pricing.routes.js';
import { hubRouter } from './modules/hub/hub.routes.js';
import { zoneRouter } from './modules/zone/zone.routes.js';
import { publicRouter } from './modules/public/public.routes.js';
import { notificationRouter } from './modules/notification/notification.routes.js';
import { walletRouter } from './modules/wallet/wallet.routes.js';
import { reconciliationRouter } from './modules/reconciliation/reconciliation.routes.js';
import { adminPayoutRouter } from './modules/payout/payout.routes.js';
import { authenticate } from './middleware/authenticate.js';
import { authorize } from './middleware/authorize.js';
import { AppError } from './errors/app-error.js';
import { ParcelSchema, Parcel, createPlaceholderParcel } from '@courier/shared';
import { Role } from '@prisma/client';
import { bullBoardAdapters } from './lib/queue/queue-registry.js';


export const createApp = (): Express => {
  const app = express();

  // Security and core middleware
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Bull Board queue monitoring dashboard — SUPER_ADMIN only
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({ queues: bullBoardAdapters, serverAdapter });
  app.use('/admin/queues', authenticate, authorize(Role.SUPER_ADMIN), serverAdapter.getRouter());

  app.use('/health', healthRouter);

  // Auth routes
  app.use('/auth', authRouter);

  // Merchant routes
  app.use('/merchants', merchantRouter);

  // Rider routes
  app.use('/riders', riderRouter);

  // Parcel routes
  app.use('/parcels', parcelRouter);

  // Pricing routes
  app.use('/pricing', pricingRouter);

  // Hub routes
  app.use('/hubs', hubRouter);

  // Zone routes
  app.use('/zones', zoneRouter);

  // Public tracking routes
  app.use('/public', publicRouter);

  // Notification routes
  app.use('/notifications', notificationRouter);

  // Wallet routes
  app.use('/merchants/me/wallet', walletRouter);

  // Reconciliation routes
  app.use('/reconciliations', reconciliationRouter);

  // Admin Payout routes
  app.use('/admin/payouts', adminPayoutRouter);

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
