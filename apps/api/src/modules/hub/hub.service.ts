import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { Role } from '@prisma/client';

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
    return hub;
  },

  async getAllHubs() {
    return prisma.hub.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async assignManager(hubId: string, userId: string) {
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

    return updatedUser;
  },
};
