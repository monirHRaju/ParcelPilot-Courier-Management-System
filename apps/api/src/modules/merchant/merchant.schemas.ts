import { z } from 'zod';

export const onboardMerchantSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessAddress: z.string().min(1, 'Business address is required'),
  contactPersonName: z.string().min(1, 'Contact person name is required'),
});
