import { z } from 'zod';
import { SizeTier, ServiceType } from '@prisma/client';

export const createParcelSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientPhone: z.string().min(1, 'Recipient phone is required'),
  pickupAddressText: z.string().min(1, 'Pickup address is required'),
  deliveryAddressText: z.string().min(1, 'Delivery address is required'),
  weightGrams: z.number().int().positive('Weight must be positive'),
  sizeTier: z.nativeEnum(SizeTier),
  codAmount: z.number().int().nonnegative('COD amount cannot be negative'),
  serviceType: z.nativeEnum(ServiceType),
});
