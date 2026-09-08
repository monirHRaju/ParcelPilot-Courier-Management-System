import { Router } from 'express';
import { payoutController } from './payout.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { Role } from '@prisma/client';

export const adminPayoutRouter = Router();

// All admin payout routes are for SUPER_ADMIN
adminPayoutRouter.use(authenticate, authorize(Role.SUPER_ADMIN));

adminPayoutRouter.get('/', payoutController.getAdminPayouts);
adminPayoutRouter.patch('/:id', payoutController.updateAdminPayout);
