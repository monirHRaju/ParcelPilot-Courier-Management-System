import { z } from 'zod';

export const createHubSchema = z.object({
  name: z.string().min(1, 'Hub name is required'),
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
  upazilaOrThana: z.string().min(1, 'Upazila/Thana is required'),
  addressLine: z.string().min(1, 'Address line is required'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export const assignManagerSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});
