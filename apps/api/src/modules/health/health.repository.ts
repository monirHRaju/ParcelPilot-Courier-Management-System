import { prisma } from '../../lib/prisma.js';
import { HealthCheck } from '@prisma/client';

export class HealthRepository {
  async getHealthCheckCount(): Promise<number> {
    return prisma.healthCheck.count();
  }

  async createHealthCheck(): Promise<HealthCheck> {
    return prisma.healthCheck.create({
      data: {},
    });
  }

  async getLatestHealthCheck(): Promise<HealthCheck | null> {
    return prisma.healthCheck.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export const healthRepository = new HealthRepository();
