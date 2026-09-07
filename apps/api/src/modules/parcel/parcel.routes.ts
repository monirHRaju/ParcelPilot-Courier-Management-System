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
