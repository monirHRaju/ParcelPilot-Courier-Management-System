import { Router } from 'express';
import { pricingController } from './pricing.controller.js';

export const pricingRouter = Router();

// Calculate price estimate without creating a parcel
pricingRouter.post(
  '/estimate',
  pricingController.estimate
);
