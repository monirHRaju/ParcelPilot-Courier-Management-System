import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const mockHealthRepo = {
  getHealthCheckCount: jest.fn<() => Promise<number>>().mockResolvedValue(1),
};

const mockRedis = {
  status: 'ready',
  ping: jest.fn<() => Promise<string>>().mockResolvedValue('PONG'),
  connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
};

jest.unstable_mockModule('../health.repository.js', () => ({
  healthRepository: mockHealthRepo,
  HealthRepository: class {},
}));

jest.unstable_mockModule('../../../lib/redis.js', () => ({
  redis: mockRedis,
}));

const { healthRouter } = await import('../health.routes.js');

describe('Health Module', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use('/health', healthRouter);
  });

  it('GET /health should return 200 and status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });
});
