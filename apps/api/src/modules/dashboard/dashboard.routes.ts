import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { Role } from '@prisma/client';

export const dashboardRouter = Router();

dashboardRouter.get(
  '/admin',
  authenticate,
  authorize(Role.SUPER_ADMIN),
  DashboardController.getAdminDashboard
);

dashboardRouter.get(
  '/merchant',
  authenticate,
  authorize(Role.MERCHANT),
  DashboardController.getMerchantDashboard
);
