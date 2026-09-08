import { Router } from 'express';
import { reconciliationController } from './reconciliation.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { Role } from '@prisma/client';

const router = Router();

// All reconciliation routes are for HUB_MANAGER
router.use(authenticate, authorize(Role.HUB_MANAGER));

router.post('/', reconciliationController.createOrGet);
router.post('/:id/items', reconciliationController.addItem);
router.post('/:id/close', reconciliationController.close);
router.get('/', reconciliationController.getMyReconciliations);
router.get('/:id', reconciliationController.getDetail);

export const reconciliationRouter = router;
