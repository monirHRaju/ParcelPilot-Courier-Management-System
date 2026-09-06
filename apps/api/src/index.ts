import express, { Request, Response } from 'express';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { ParcelSchema, Parcel, createPlaceholderParcel } from '@courier/shared';

const app = express();

app.use(express.json());

app.get('/health', async (_req: Request, res: Response) => {
  try {
    const healthCheckCount = await prisma.healthCheck.count();
    res.json({
      status: 'ok',
      service: 'courier-api',
      environment: env.NODE_ENV,
      database: 'connected',
      healthCheckCount,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'courier-api',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown database error',
    });
  }
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

app.listen(env.PORT, () => {
  console.log(`[API Server] Running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
});
