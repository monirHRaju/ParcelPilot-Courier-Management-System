import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';

type CreateZoneData = {
  division: string;
  district: string;
  upazilaOrThana: string;
  hubId: string;
};

export const zoneService = {
  async createZone(data: CreateZoneData) {
    const existingZone = await prisma.zone.findUnique({
      where: { upazilaOrThana: data.upazilaOrThana },
    });

    if (existingZone) {
      throw AppError.badRequest(
        `A hub mapping already exists for the Upazila/Thana: ${data.upazilaOrThana}`,
        'ZONE_ALREADY_MAPPED'
      );
    }

    const hubExists = await prisma.hub.findUnique({
      where: { id: data.hubId },
    });

    if (!hubExists) {
      throw AppError.notFound('Hub not found', 'HUB_NOT_FOUND');
    }

    const zone = await prisma.zone.create({
      data,
    });
    return zone;
  },

  async getAllZones() {
    return prisma.zone.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        hub: true,
      },
    });
  },

  async resolveHubForAddress(address: { upazilaOrThana: string }) {
    const zone = await prisma.zone.findUnique({
      where: { upazilaOrThana: address.upazilaOrThana },
      include: {
        hub: true,
      },
    });

    return zone?.hub || null;
  },
};
