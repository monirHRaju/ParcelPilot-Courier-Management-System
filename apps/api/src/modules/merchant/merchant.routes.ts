import { Router } from 'express';
import { merchantController } from './merchant.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { Role } from '@prisma/client';

export const merchantRouter = Router();

// Onboard new merchant profile
merchantRouter.post(
  '/onboard',
  authenticate,
  authorize(Role.MERCHANT),
  merchantController.onboard
);

// Get my merchant profile
merchantRouter.get(
  '/me',
  authenticate,
  authorize(Role.MERCHANT),
  merchantController.getMe
);
