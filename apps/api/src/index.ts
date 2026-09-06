import express, { Request, Response } from 'express';
import { ParcelSchema, Parcel, createPlaceholderParcel } from '@courier/shared';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'courier-api' });
});

app.get('/api/parcels/sample', (_req: Request, res: Response) => {
  const sampleParcel: Parcel = createPlaceholderParcel();
  
  // Validate sample parcel with shared Zod schema
  const validationResult = ParcelSchema.safeParse(sampleParcel);
  
  if (!validationResult.success) {
    res.status(500).json({ error: 'Invalid parcel schema', details: validationResult.error.format() });
    return;
  }

  res.json({
    message: 'Sample parcel fetched successfully',
    parcel: validationResult.data,
  });
});

app.listen(PORT, () => {
  console.log(`[API Server] Running on http://localhost:${PORT}`);
});
