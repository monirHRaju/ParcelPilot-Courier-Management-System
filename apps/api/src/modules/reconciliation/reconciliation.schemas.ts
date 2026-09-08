import { z } from 'zod';

export const addReconciliationItemSchema = z.object({
  codCollectionId: z.string().uuid('Invalid codCollectionId'),
  confirmedAmountPaisa: z.number().int().min(0, 'Amount must be a positive integer or zero'),
  note: z.string().optional(),
});
