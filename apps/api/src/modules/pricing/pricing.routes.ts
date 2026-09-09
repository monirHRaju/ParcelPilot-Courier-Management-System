import { Router } from 'express';
import { pricingController } from './pricing.controller.js';
import { publicApiLimiter } from '../../middleware/rate-limiter.js';

export const pricingRouter = Router();

// Calculate price estimate without creating a parcel
pricingRouter.post(
  '/estimate',
  publicApiLimiter,
  pricingController.estimate
);
