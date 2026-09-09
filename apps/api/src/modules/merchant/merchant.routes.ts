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

// Update my profile
merchantRouter.patch(
  '/me',
  authenticate,
  authorize(Role.MERCHANT),
  merchantController.updateProfile
);

// Update my payout method
merchantRouter.patch(
  '/me/payout-method',
  authenticate,
  authorize(Role.MERCHANT),
  merchantController.updatePayoutMethod
);

import { payoutController } from '../payout/payout.controller.js';

// Request payout
merchantRouter.post(
  '/me/payout',
  authenticate,
  authorize(Role.MERCHANT),
  payoutController.requestPayout
);

// Get my payouts
merchantRouter.get(
  '/me/payouts',
  authenticate,
  authorize(Role.MERCHANT),
  payoutController.getMyPayouts
);
