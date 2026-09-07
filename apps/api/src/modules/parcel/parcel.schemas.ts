import { z } from 'zod';
import { SizeTier, ServiceType, ParcelStatus } from '@prisma/client';

export const addressSchema = z.object({
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
  upazilaOrThana: z.string().min(1, 'Upazila/Thana is required'),
  area: z.string().min(1, 'Area is required'),
  addressLine: z.string().min(1, 'Address line is required'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export const createParcelSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientPhone: z.string().min(1, 'Recipient phone is required'),
  pickupAddress: addressSchema,
  deliveryAddress: addressSchema,
  weightGrams: z.number().int().positive('Weight must be positive'),
  sizeTier: z.nativeEnum(SizeTier),
  codAmount: z.number().int().nonnegative('COD amount cannot be negative'),
  serviceType: z.nativeEnum(ServiceType),
});

export const transitionStatusSchema = z.object({
  status: z.nativeEnum(ParcelStatus, {
    errorMap: () => ({ message: 'Invalid parcel status' }),
  }),
  note: z.string().optional(),
});
