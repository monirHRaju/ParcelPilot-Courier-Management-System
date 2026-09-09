import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { Role } from '@prisma/client';
import { redis } from '../../lib/redis.js';

type CreateHubData = {
  name: string;
  division: string;
  district: string;
  upazilaOrThana: string;
  addressLine: string;
  latitude?: number | null;
  longitude?: number | null;
};

export const hubService = {
  async createHub(data: CreateHubData) {
    const hub = await prisma.hub.create({
      data,
    });
    
    // Invalidate the cache whenever a new hub is created
    await redis.del('cache:hubs:all');
    
    return hub;
  },

  async getAllHubs() {
    const cachedHubs = await redis.get('cache:hubs:all');
    if (cachedHubs) {
      return JSON.parse(cachedHubs);
    }

    const hubs = await prisma.hub.findMany({
      orderBy: { createdAt: 'desc' },
    });

    await redis.set('cache:hubs:all', JSON.stringify(hubs), 'EX', 3600);
    
    return hubs;
  },

  async assignManager(hubId: string, userId: string, adminId?: string) {
    const hub = await prisma.hub.findUnique({ where: { id: hubId } });
    if (!hub) {
      throw AppError.notFound('Hub not found', 'HUB_NOT_FOUND');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }

    if (user.role !== Role.HUB_MANAGER) {
      throw AppError.badRequest('User is not a HUB_MANAGER', 'INVALID_USER_ROLE');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { hubId: hub.id },
      select: {
        id: true,
        phone: true,
        role: true,
        hubId: true,
      }
    });

    if (adminId) {
      const { createAuditLog } = await import('../../lib/audit.js');
      await createAuditLog({
        userId: adminId,
        entityType: 'User',
        entityId: userId,
        action: 'UPDATE',
        changes: { hubId: hub.id }
      });
    }

    return updatedUser;
  },
};
