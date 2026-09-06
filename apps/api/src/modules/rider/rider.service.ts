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

  async approveRider(riderId: string) {
    const rider = await prisma.rider.findUnique({
      where: { id: riderId }
    });

    if (!rider) {
      throw AppError.notFound('Rider not found', 'RIDER_NOT_FOUND');
    }

    if (rider.isApproved) {
      throw AppError.badRequest('Rider is already approved', 'RIDER_ALREADY_APPROVED');
    }

    const updatedRider = await prisma.rider.update({
      where: { id: riderId },
      data: { isApproved: true }
    });

    return updatedRider;
  }
};
