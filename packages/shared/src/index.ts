import { z } from 'zod';

export const DeliveryStatusSchema = z.enum([
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED'
]);

export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

export const ParcelSchema = z.object({
  id: z.string().uuid(),
  trackingNumber: z.string(),
  sender: z.string(),
  recipient: z.string(),
  destinationAddress: z.string(),
  weightKg: z.number().positive(),
  status: DeliveryStatusSchema,
  createdAt: z.string().datetime(),
});

export type Parcel = z.infer<typeof ParcelSchema>;

export function createPlaceholderParcel(): Parcel {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    trackingNumber: 'PP-2026-98765',
    sender: 'Acme Logistics Center',
    recipient: 'Jane Doe',
    destinationAddress: '742 Evergreen Terrace, Springfield',
    weightKg: 3.2,
    status: 'IN_TRANSIT',
    createdAt: new Date().toISOString(),
  };
}
