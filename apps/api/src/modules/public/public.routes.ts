import { Router } from 'express';
import { publicController } from './public.controller.js';

const router = Router();

router.get('/parcels/:id/track', publicController.trackParcel);

export { router as publicRouter };
