import { z } from 'zod';

export const createZoneSchema = z.object({
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
  upazilaOrThana: z.string().min(1, 'Upazila/Thana is required'),
  hubId: z.string().uuid('Invalid hub ID format'),
});
