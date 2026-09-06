import { healthRepository, HealthRepository } from './health.repository.js';
import { redis } from '../../lib/redis.js';
import { env } from '../../config/env.js';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  environment: string;
  services: {
    database: {
      status: 'up' | 'down';
      healthCheckCount: number;
    };
    redis: {
      status: 'up' | 'down';
    };
  };
}

export class HealthService {
  constructor(private readonly repo: HealthRepository = healthRepository) {}

  async getHealthStatus(): Promise<HealthCheckResult> {
    let dbStatus: 'up' | 'down' = 'down';
    let dbCount = 0;

    try {
      dbCount = await this.repo.getHealthCheckCount();
      dbStatus = 'up';
    } catch {
      dbStatus = 'down';
    }

    let redisStatus: 'up' | 'down' = 'down';
    try {
      if (redis.status === 'wait') {
        await redis.connect();
      }
      const pong = await redis.ping();
      redisStatus = pong === 'PONG' ? 'up' : 'down';
    } catch {
      redisStatus = 'down';
    }

    const isHealthy = dbStatus === 'up' && redisStatus === 'up';

    return {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      services: {
        database: {
          status: dbStatus,
          healthCheckCount: dbCount,
        },
        redis: {
          status: redisStatus,
        },
      },
    };
  }

  async recordHealthPing() {
    return this.repo.createHealthCheck();
  }
}

export const healthService = new HealthService();
