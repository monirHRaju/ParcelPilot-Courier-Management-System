import { z } from 'zod';

export const codCollectSchema = z.object({
  amountPaisa: z.number().int().positive('amountPaisa must be a positive integer'),
  note: z.string().optional(),
});
