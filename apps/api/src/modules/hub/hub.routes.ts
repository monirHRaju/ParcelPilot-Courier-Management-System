import { Router } from 'express';
import { hubController } from './hub.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { Role } from '@prisma/client';

export const hubRouter = Router();

// Create new hub
hubRouter.post(
  '/',
  authenticate,
  authorize(Role.SUPER_ADMIN),
  hubController.create
);

// Get all hubs
hubRouter.get(
  '/',
  authenticate,
  hubController.getAll
);

// Assign manager to hub
hubRouter.patch(
  '/:id/assign-manager',
  authenticate,
  authorize(Role.SUPER_ADMIN),
  hubController.assignManager
);
