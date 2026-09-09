import { Router } from 'express';
import { publicController } from './public.controller.js';
import { publicApiLimiter } from '../../middleware/rate-limiter.js';

const router = Router();

router.get('/parcels/:id/track', publicApiLimiter, publicController.trackParcel);

export { router as publicRouter };
