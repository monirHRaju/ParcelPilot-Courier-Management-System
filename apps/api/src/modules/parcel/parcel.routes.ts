import { Router } from 'express';
import multer from 'multer';
import { parcelController } from './parcel.controller.js';
import { codController } from '../cod/cod.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { Role } from '@prisma/client';

const upload = multer({ storage: multer.memoryStorage() });

export const parcelRouter = Router();

// Bulk create parcels via CSV
parcelRouter.post(
  '/bulk',
  authenticate,
  authorize(Role.MERCHANT),
  upload.single('file'),
  parcelController.bulkCreate
);

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

// Assign a rider manually
parcelRouter.post(
  '/:id/assign',
  authenticate,
  authorize(Role.HUB_MANAGER),
  parcelController.assign
);

// Auto-assign the nearest online rider
parcelRouter.post(
  '/:id/auto-assign',
  authenticate,
  authorize(Role.HUB_MANAGER),
  parcelController.autoAssign
);

// COD collection — rider marks cash as collected
parcelRouter.post(
  '/:id/cod-collect',
  authenticate,
  authorize(Role.RIDER),
  codController.collectCod
);

// Rider marks parcel as delivered
parcelRouter.post(
  '/:id/deliver',
  authenticate,
  authorize(Role.RIDER),
  upload.single('photo'),
  parcelController.deliver
);

