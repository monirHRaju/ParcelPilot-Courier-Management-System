import { Router } from 'express';
import { healthController } from './health.controller.js';

const router = Router();

router.get('/', healthController.getHealth);
router.get('/test-error', healthController.triggerTestError);

export const healthRouter = router;
