import { Router } from 'express';
import { parcelController } from './parcel.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { Role } from '@prisma/client';

export const parcelRouter = Router();

// Create new parcel
parcelRouter.post(
  '/',
  authenticate,
  authorize(Role.MERCHANT),
  parcelController.create
);

// Get my parcels
parcelRouter.get(
  '/mine',
  authenticate,
  authorize(Role.MERCHANT),
  parcelController.getMine
);

// Get parcel by ID
parcelRouter.get(
  '/:id',
  authenticate,
  parcelController.getById
);

// Transition parcel status
parcelRouter.post(
  '/:id/status',
  authenticate,
  authorize(Role.RIDER, Role.HUB_MANAGER, Role.SUPER_ADMIN),
  parcelController.transitionStatus
);

// Get parcel status history
parcelRouter.get(
  '/:id/history',
  authenticate,
  parcelController.getHistory
);
