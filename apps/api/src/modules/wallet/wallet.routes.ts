import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { Role } from '@prisma/client';
import { walletController } from './wallet.controller.js';

const router = Router();

// All wallet routes require MERCHANT auth
router.use(authenticate, authorize(Role.MERCHANT));

router.get('/', walletController.getMyWallet);
router.get('/transactions', walletController.getTransactions);

export const walletRouter = router;
