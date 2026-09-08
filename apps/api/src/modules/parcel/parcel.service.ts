import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { SizeTier, ServiceType, Role } from '@prisma/client';
import { pricingService } from '../pricing/pricing.service.js';
import { zoneService } from '../zone/zone.service.js';
import { logger } from '../../lib/logger.js';

type AddressData = {
  division: string;
  district: string;
  upazilaOrThana: string;
  area: string;
  addressLine: string;
  latitude?: number | null;
  longitude?: number | null;
};

type CreateParcelData = {
  recipientName: string;
  recipientPhone: string;
  pickupAddress: AddressData;
  deliveryAddress: AddressData;
  weightGrams: number;
  sizeTier: SizeTier;
  codAmount: number;
  serviceType: ServiceType;
};

export const parcelService = {
  async createParcel(userId: string, data: CreateParcelData) {
    const merchant = await prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw AppError.forbidden('Only registered merchants can create parcels', 'MERCHANT_NOT_FOUND');
    }

    const { pickupAddress, deliveryAddress, ...parcelData } = data;

    const pricing = pricingService.calculatePrice({
      pickupDistrict: pickupAddress.district,
      deliveryDistrict: deliveryAddress.district,
      sizeTier: data.sizeTier,
      serviceType: data.serviceType,
      codAmount: data.codAmount,
    });

    const destinationHub = await zoneService.resolveHubForAddress({ upazilaOrThana: deliveryAddress.upazilaOrThana });

    const parcel = await prisma.parcel.create({
      data: {
        merchant: { connect: { id: merchant.id } },
        ...parcelData,
        baseFee: pricing.baseFee,
        codHandlingFee: pricing.codHandlingFee,
        totalFee: pricing.totalFee,
        destinationHub: destinationHub ? { connect: { id: destinationHub.id } } : undefined,
        pickupAddress: {
          create: pickupAddress,
        },
        deliveryAddress: {
          create: deliveryAddress,
        },
      },
      include: {
        pickupAddress: true,
        deliveryAddress: true,
      },
    });

    return parcel;
  },

  async createBulkParcels(userId: string, validRows: { originalIndex: number; data: CreateParcelData }[]) {
    const merchant = await prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw AppError.forbidden('Only registered merchants can create parcels', 'MERCHANT_NOT_FOUND');
    }

    const createdResults: { row: number, success: boolean, parcelId: string }[] = [];

    await prisma.$transaction(async (tx) => {
      for (const item of validRows) {
        const { pickupAddress, deliveryAddress, ...parcelData } = item.data;

        const pricing = pricingService.calculatePrice({
          pickupDistrict: pickupAddress.district,
          deliveryDistrict: deliveryAddress.district,
          sizeTier: item.data.sizeTier,
          serviceType: item.data.serviceType,
          codAmount: item.data.codAmount,
        });

        // We can't use tx-bound zone resolution easily since it's in another service, but findUnique is safe here
        const destinationHub = await zoneService.resolveHubForAddress({ upazilaOrThana: deliveryAddress.upazilaOrThana });

        const parcel = await tx.parcel.create({
          data: {
            merchant: { connect: { id: merchant.id } },
            ...parcelData,
            baseFee: pricing.baseFee,
            codHandlingFee: pricing.codHandlingFee,
            totalFee: pricing.totalFee,
            destinationHub: destinationHub ? { connect: { id: destinationHub.id } } : undefined,
            pickupAddress: { create: pickupAddress },
            deliveryAddress: { create: deliveryAddress },
          },
        });
        createdResults.push({ row: item.originalIndex, success: true, parcelId: parcel.id });
      }
    });

    return createdResults;
  },

  async getMyParcels(userId: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw AppError.forbidden('Only registered merchants can access this', 'MERCHANT_NOT_FOUND');
    }

    const parcels = await prisma.parcel.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
      include: {
        pickupAddress: true,
        deliveryAddress: true,
      },
    });

    return parcels;
  },

  async getParcelById(id: string, user: { id: string; role: string }) {
    const parcel = await prisma.parcel.findUnique({
      where: { id },
      include: {
        pickupAddress: true,
        deliveryAddress: true,
      },
    });

    if (!parcel) {
      throw AppError.notFound('Parcel not found', 'PARCEL_NOT_FOUND');
    }

    if (user.role === Role.MERCHANT) {
      const merchant = await prisma.merchant.findUnique({
        where: { userId: user.id },
      });

      if (!merchant || parcel.merchantId !== merchant.id) {
        throw AppError.forbidden('You can only view your own parcels', 'FORBIDDEN');
      }
    }

    return parcel;
  },

  async transitionParcelStatus(parcelId: string, newStatus: import('@prisma/client').ParcelStatus, userId: string, note?: string) {
    const parcel = await prisma.parcel.findUnique({
      where: { id: parcelId },
      include: { merchant: true },
    });

    if (!parcel) {
      throw AppError.notFound('Parcel not found', 'PARCEL_NOT_FOUND');
    }

    const { ParcelStatus } = await import('@prisma/client');
    const currentStatus = parcel.status;

    // Define allowed transitions
    const allowedTransitions: Record<string, string[]> = {
      [ParcelStatus.PENDING]: [ParcelStatus.PICKED_UP, ParcelStatus.FAILED],
      [ParcelStatus.PICKED_UP]: [ParcelStatus.IN_TRANSIT],
      [ParcelStatus.IN_TRANSIT]: [ParcelStatus.AT_HUB, ParcelStatus.OUT_FOR_DELIVERY],
      [ParcelStatus.AT_HUB]: [ParcelStatus.OUT_FOR_DELIVERY],
      [ParcelStatus.OUT_FOR_DELIVERY]: [ParcelStatus.DELIVERED, ParcelStatus.FAILED, ParcelStatus.RETURNED],
    };

    const validNextStates = allowedTransitions[currentStatus] || [];
    
    if (!validNextStates.includes(newStatus)) {
      throw AppError.badRequest(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const result = await prisma.$transaction([
      prisma.parcel.update({
        where: { id: parcelId },
        data: { status: newStatus },
      }),
      prisma.parcelStatusHistory.create({
        data: {
          parcelId,
          status: newStatus,
          changedByUserId: userId,
          note,
        },
      }),
    ]);

    const updatedParcel = result[0];
    const history = result[1];

    // Notification / Socket / SMS logic
    const notifyStatuses: import('@prisma/client').ParcelStatus[] = [
      ParcelStatus.PICKED_UP,
      ParcelStatus.OUT_FOR_DELIVERY,
      ParcelStatus.DELIVERED,
      ParcelStatus.FAILED,
      ParcelStatus.RETURNED
    ];

    if (notifyStatuses.includes(newStatus)) {
      try {
        // Send SMS to recipient
        // TODO: This should be moved to a BullMQ queue later (Module 6)
        logger.info(`[SMS to ${parcel.recipientPhone}]: Your parcel status is now ${newStatus}`);

        // Create Notification for the merchant
        await prisma.notification.create({
          data: {
            userId: parcel.merchant.userId,
            type: 'PARCEL_STATUS_CHANGE',
            message: `Parcel ${parcel.id} status changed to ${newStatus}`,
            parcelId: parcel.id,
          }
        });

        // Emit socket events
        const { getIO } = await import('../../lib/socket.js');
        const io = getIO();
        const payload = { parcelId: parcel.id, status: newStatus, timestamp: new Date().toISOString() };
        
        // Notify merchant dashboard
        io.to(`user:${parcel.merchant.userId}`).emit('status:update', payload);
        
        // Notify public tracking namespace
        io.of('/tracking').to(`parcel:${parcel.id}`).emit('status:update', payload);

      } catch (error) {
        logger.error({ error, parcelId, newStatus }, 'Failed to dispatch notifications for status change');
        // Do not fail the transaction if notifications fail
      }
    }

    return { parcel: updatedParcel, history };
  },

  async getParcelHistory(parcelId: string, user: { id: string; role: string }) {
    // First, verify access to the parcel
    await this.getParcelById(parcelId, user);

    const history = await prisma.parcelStatusHistory.findMany({
      where: { parcelId },
      orderBy: { createdAt: 'asc' },
    });

    return history;
  },

  async assignRider(parcelId: string, riderId: string) {
    const parcel = await prisma.parcel.findUnique({ where: { id: parcelId } });
    if (!parcel) {
      throw AppError.notFound('Parcel not found', 'PARCEL_NOT_FOUND');
    }

    const rider = await prisma.rider.findUnique({ where: { id: riderId } });
    if (!rider) {
      throw AppError.notFound('Rider not found', 'RIDER_NOT_FOUND');
    }

    return prisma.parcel.update({
      where: { id: parcelId },
      data: { riderId },
    });
  },

  async autoAssignRider(parcelId: string) {
    const parcel = await prisma.parcel.findUnique({ where: { id: parcelId } });
    if (!parcel) {
      throw AppError.notFound('Parcel not found', 'PARCEL_NOT_FOUND');
    }

    if (!parcel.destinationHubId) {
      throw AppError.badRequest('Cannot auto-assign because parcel has no destination hub mapping', 'NO_DESTINATION_HUB');
    }

    const { riderService } = await import('../rider/rider.service.js');
    const riderId = await riderService.findNearestOnlineRider(parcel.destinationHubId);

    if (!riderId) {
      throw AppError.conflict('No rider currently available', 'NO_RIDER_AVAILABLE');
    }

    return prisma.parcel.update({
      where: { id: parcelId },
      data: { riderId },
    });
  }
};
