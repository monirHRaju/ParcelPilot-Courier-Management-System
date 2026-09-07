import { Router } from 'express';
import { zoneController } from './zone.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { Role } from '@prisma/client';

export const zoneRouter = Router();

// Create new zone mapping
zoneRouter.post(
  '/',
  authenticate,
  authorize(Role.SUPER_ADMIN),
  zoneController.create
);

// Get all zones
zoneRouter.get(
  '/',
  authenticate,
  zoneController.getAll
);
