import { Router } from 'express';
import { riderController } from './rider.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { Role } from '@prisma/client';

export const riderRouter = Router();

// Onboard new rider profile
riderRouter.post(
  '/onboard',
  authenticate,
  authorize(Role.RIDER),
  riderController.onboard
);

// Get my rider profile
riderRouter.get(
  '/me',
  authenticate,
  authorize(Role.RIDER),
  riderController.getMe
);

// Approve a rider (SUPER_ADMIN only)
riderRouter.patch(
  '/:id/approve',
  authenticate,
  authorize(Role.SUPER_ADMIN),
  riderController.approve
);

// Update rider location
riderRouter.post(
  '/location',
  authenticate,
  authorize(Role.RIDER),
  riderController.updateLocation
);
