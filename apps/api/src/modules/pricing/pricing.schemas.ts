import { z } from 'zod';
import { SizeTier, ServiceType } from '@prisma/client';
import { addressSchema } from '../parcel/parcel.schemas.js';

export const estimatePriceSchema = z.object({
  pickupAddress: addressSchema,
  deliveryAddress: addressSchema,
  weightGrams: z.number().int().positive('Weight must be positive').optional(),
  sizeTier: z.nativeEnum(SizeTier),
  codAmount: z.number().int().nonnegative('COD amount cannot be negative'),
  serviceType: z.nativeEnum(ServiceType),
});
