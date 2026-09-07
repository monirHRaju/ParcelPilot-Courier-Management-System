import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { VehicleType } from '@prisma/client';

export const riderService = {
  async onboardRider(userId: string, data: { vehicleType: VehicleType; nidNumber: string; coverageZone: string }) {
    // Check if the user already has a rider profile
    const existingRider = await prisma.rider.findUnique({
      where: { userId },
    });

    if (existingRider) {
      throw AppError.badRequest('Rider profile already exists for this user', 'RIDER_ALREADY_EXISTS');
    }

    const rider = await prisma.rider.create({
      data: {
        userId,
        vehicleType: data.vehicleType,
        nidNumber: data.nidNumber,
        coverageZone: data.coverageZone,
        isApproved: false,
      },
    });

    return rider;
  },

  async getMyProfile(userId: string) {
    const rider = await prisma.rider.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            role: true,
            isActive: true,
          }
        }
      }
    });

    if (!rider) {
      throw AppError.notFound('Rider profile not found', 'RIDER_NOT_FOUND');
    }

    return rider;
  },

  async approveRider(riderId: string, hubId?: string) {
    const rider = await prisma.rider.findUnique({
      where: { id: riderId }
    });

    if (!rider) {
      throw AppError.notFound('Rider not found', 'RIDER_NOT_FOUND');
    }

    if (rider.isApproved) {
      throw AppError.badRequest('Rider is already approved', 'RIDER_ALREADY_APPROVED');
    }

    if (hubId) {
      const hub = await prisma.hub.findUnique({ where: { id: hubId } });
      if (!hub) {
        throw AppError.notFound('Hub not found', 'HUB_NOT_FOUND');
      }
    }

    const updatedRider = await prisma.rider.update({
      where: { id: riderId },
      data: { isApproved: true, hubId }
    });

    return updatedRider;
  },

  async updateLocation(userId: string, latitude: number, longitude: number) {
    const rider = await prisma.rider.findUnique({
      where: { userId },
    });

    if (!rider) {
      throw AppError.notFound('Rider profile not found', 'RIDER_NOT_FOUND');
    }

    if (!rider.isApproved) {
      throw AppError.forbidden('Rider is not approved yet', 'RIDER_NOT_APPROVED');
    }

    const { redis } = await import('../../lib/redis.js');
    
    // Update location via GEOADD
    await redis.geoadd('riders:locations', longitude, latitude, rider.id);
    
    // Set online status with 2 minute TTL (120 seconds)
    await redis.set(`riders:online:${rider.id}`, '1', 'EX', 120);

    // Store hubId in metadata
    if (rider.hubId) {
      await redis.hset(`riders:meta:${rider.id}`, 'hubId', rider.hubId);
    }
    
    return rider;
  },

  async findNearestOnlineRider(hubId: string): Promise<string | null> {
    const hub = await prisma.hub.findUnique({
      where: { id: hubId }
    });

    if (!hub || !hub.latitude || !hub.longitude) {
      return null;
    }

    const { redis } = await import('../../lib/redis.js');

    // Find riders within 10km of the hub
    // GEOSEARCH key [FROMMEMBER member | FROMLONLAT longitude latitude] [BYRADIUS radius m|km|ft|mi | BYBOX width height m|km|ft|mi] [ASC|DESC]
    const candidates = await redis.geosearch(
      'riders:locations',
      'FROMLONLAT',
      hub.longitude,
      hub.latitude,
      'BYRADIUS',
      10,
      'km',
      'ASC'
    ) as string[];

    for (const riderId of candidates) {
      // Check if online
      const isOnline = await redis.get(`riders:online:${riderId}`);
      if (!isOnline) {
        continue;
      }

      // Check if hubId matches
      const riderHubId = await redis.hget(`riders:meta:${riderId}`, 'hubId');
      if (riderHubId === hubId) {
        return riderId;
      }
    }

    return null;
  }
};
