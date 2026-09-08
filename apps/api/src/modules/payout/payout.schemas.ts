import { z } from 'zod';
import { PayoutStatus } from '@prisma/client';

export const updatePayoutSchema = z.object({
  status: z.nativeEnum(PayoutStatus),
  reference: z.string().optional(),
  failureReason: z.string().optional(),
});
