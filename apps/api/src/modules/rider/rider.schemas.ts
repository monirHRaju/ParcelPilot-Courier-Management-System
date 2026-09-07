import { z } from 'zod';
import { VehicleType } from '@prisma/client';

export const onboardRiderSchema = z.object({
  vehicleType: z.nativeEnum(VehicleType, {
    errorMap: () => ({ message: 'Invalid vehicle type' }),
  }),
  nidNumber: z.string().min(1, 'NID number is required'),
  coverageZone: z.string().min(1, 'Coverage zone is required'),
});

export const approveRiderSchema = z.object({
  id: z.string().uuid('Invalid Rider ID'),
  hubId: z.string().uuid('Invalid Hub ID').optional(),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
