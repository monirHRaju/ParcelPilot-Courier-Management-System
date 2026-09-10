import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Must mock the limiter BEFORE importing the router that uses it
jest.unstable_mockModule('../../../middleware/rate-limiter.js', () => ({
  publicApiLimiter: (req: any, res: any, next: any) => next(),
}));

jest.unstable_mockModule('../../../lib/prisma.js', () => {
  return {
    prisma: {
      parcel: {
        findUnique: jest.fn(),
      },
    },
  };
});

jest.unstable_mockModule('../../../lib/redis.js', () => {
  return {
    redis: {
      get: jest.fn(),
      geopos: jest.fn(),
    },
  };
});

// Dynamic imports are required after unstable_mockModule in ESM Jest
const { publicRouter } = await import('../public.routes.js');
const { prisma } = await import('../../../lib/prisma.js');
const { errorHandler } = await import('../../../middleware/error-handler.js');

describe('Public Tracking Endpoint - GET /public/parcels/:id/track', () => {
  let app: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/public', publicRouter);
    app.use(errorHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if parcel ID does not exist', async () => {
    (prisma.parcel.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await request(app).get('/public/parcels/NON_EXISTENT/track');
    
    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe('Parcel not found');
  });

  it('should return 200 and tracking details if parcel exists', async () => {
    const mockParcel = {
      id: 'PARCEL_123',
      status: 'IN_TRANSIT',
      recipientName: 'John Doe',
      statusHistory: [
        { status: 'PENDING', timestamp: new Date().toISOString() },
        { status: 'PICKED_UP', timestamp: new Date().toISOString() },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryAddress: {
        district: 'Dhaka',
        area: 'Uttara',
      }
    };

    (prisma.parcel.findUnique as jest.Mock).mockResolvedValue(mockParcel);

    const response = await request(app).get('/public/parcels/PARCEL_123/track');
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe('PARCEL_123');
    expect(response.body.status).toBe('IN_TRANSIT');
    expect(response.body).toHaveProperty('statusHistory');
  });
});
