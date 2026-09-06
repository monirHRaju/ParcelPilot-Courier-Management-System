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
});
