import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { SizeTier, ServiceType, Role, ParcelStatus } from '@prisma/client';
import { pricingService } from '../pricing/pricing.service.js';
import { zoneService } from '../zone/zone.service.js';
import { logger } from '../../lib/logger.js';
import { smsQueue, notificationQueue } from '../../lib/queue/queue.js';

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

/**
 * Returns a human-readable SMS message for a given parcel status.
 * Sent to the recipient's phone via the SMS_QUEUE worker.
 */
function smsMessageFor(status: ParcelStatus): string {
  switch (status) {
    case ParcelStatus.PICKED_UP:
      return 'Your parcel has been picked up and is on its way. Track it on ParcelPilot.';
    case ParcelStatus.OUT_FOR_DELIVERY:
      return 'Your parcel is out for delivery today. Please be available to receive it.';
    case ParcelStatus.DELIVERED:
      return 'Your parcel has been delivered. Thank you for using ParcelPilot!';
    case ParcelStatus.FAILED:
      return 'Delivery attempt for your parcel was unsuccessful. We will retry soon.';
    case ParcelStatus.RETURNED:
      return 'Your parcel is being returned to the merchant. Contact them for details.';
    default:
      return `Your parcel status has been updated to: ${status}.`;
  }
}

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

  async deliverParcel(parcelId: string, riderUserId: string, proofOfDeliveryUrl?: string) {
    const rider = await prisma.rider.findUnique({ where: { userId: riderUserId } });
    if (!rider) throw AppError.forbidden('Rider profile not found', 'RIDER_NOT_FOUND');

    const parcel = await prisma.parcel.findUnique({ where: { id: parcelId } });
    if (!parcel) throw AppError.notFound('Parcel not found', 'PARCEL_NOT_FOUND');

    if (parcel.riderId !== rider.id) {
      throw AppError.forbidden('You are not the assigned rider for this parcel', 'FORBIDDEN');
    }

    if (parcel.status !== 'OUT_FOR_DELIVERY') {
      throw AppError.badRequest('Parcel must be OUT_FOR_DELIVERY to mark as delivered', 'INVALID_STATE');
    }

    const { ParcelStatus } = await import('@prisma/client');
    const newStatus = ParcelStatus.DELIVERED;

    // We can call transitionParcelStatus here, but it doesn't accept proofOfDeliveryUrl
    // Let's just do it directly or use it and then update the URL.
    // We will do a transaction directly here since it's a specialized operation
    
    const result = await prisma.$transaction([
      prisma.parcel.update({
        where: { id: parcelId },
        data: { 
          status: newStatus,
          proofOfDeliveryUrl 
        },
      }),
      prisma.parcelStatusHistory.create({
        data: {
          parcelId,
          status: newStatus,
          changedByUserId: riderUserId,
          note: 'Marked delivered by rider',
        },
      }),
    ]);

    // Same notification logic as in transitionParcelStatus
    try {
      const { smsQueue, notificationQueue } = await import('../../lib/queue/queue.js');
      const smsMessageFor = (s: string) => `Your parcel has been delivered. Thank you for using ParcelPilot.`;
      
      await smsQueue.add('status-sms', { 
        phone: parcel.recipientPhone, 
        message: smsMessageFor(newStatus), 
        context: parcel.id 
      });
      
      await notificationQueue.add('status-notification', { 
        userId: parcel.merchantId, 
        type: 'PARCEL_STATUS_CHANGE', 
        message: `Parcel ${parcel.id} status changed to ${newStatus}`, 
        parcelId: parcel.id 
      });

      const { getIO } = await import('../../lib/socket.js');
      const io = getIO();
      const payload = {
        parcelId: parcel.id,
        status: newStatus,
        historyId: result[1].id,
      };
      
      io.to(`user:${parcel.merchantId}`).emit('status:update', payload);
      io.of('/tracking').to(`parcel:${parcel.id}`).emit('status:update', payload);
    } catch (e) {
      const { logger } = await import('../../lib/logger.js');
      logger.warn(e, 'Failed to enqueue notifications for delivery');
    }

    return result[0];
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
    const notifyStatuses: ParcelStatus[] = [
      ParcelStatus.PICKED_UP,
      ParcelStatus.OUT_FOR_DELIVERY,
      ParcelStatus.DELIVERED,
      ParcelStatus.FAILED,
      ParcelStatus.RETURNED
    ];

    if (notifyStatuses.includes(newStatus)) {
      try {
        // Enqueue SMS to recipient — retryable, durable (Module 6: BullMQ replaces the sync stub)
        await smsQueue.add('status-sms', {
          phone: parcel.recipientPhone,
          message: smsMessageFor(newStatus),
          context: parcel.id,
        });

        // Enqueue in-app notification for the merchant — creates DB row + socket push (Module 6)
        await notificationQueue.add('status-notification', {
          userId: parcel.merchant.userId,
          type: 'PARCEL_STATUS_CHANGE',
          message: `Parcel ${parcel.id} status changed to ${newStatus}`,
          parcelId: parcel.id,
        });

        // Socket emits stay SYNCHRONOUS — fire-and-forget WebSocket pushes don't
        // need a queue. If the user isn't connected, the emit is a no-op.
        const { getIO } = await import('../../lib/socket.js');
        const io = getIO();
        const payload = { parcelId: parcel.id, status: newStatus, timestamp: new Date().toISOString() };

        // Notify merchant dashboard
        io.to(`user:${parcel.merchant.userId}`).emit('status:update', payload);

        // Notify public tracking namespace
        io.of('/tracking').to(`parcel:${parcel.id}`).emit('status:update', payload);

      } catch (error) {
        logger.error({ error, parcelId, newStatus }, 'Failed to dispatch notifications for status change');
        // Do not fail the status transition if notification dispatch fails
      }
    }


    // Wallet credit/debit hooks (Module 5.1)
    // Wrapped in try/catch: a wallet failure must never block the status transition
    try {
      const { walletService } = await import('../wallet/wallet.service.js');
      const { TxType } = await import('@prisma/client');

      if (newStatus === ParcelStatus.DELIVERED) {
        // Credit the merchant the full delivery fee they were charged
        await walletService.creditWallet(
          parcel.merchantId,
          TxType.CREDIT_DELIVERY_FEE,
          parcel.totalFee,
          parcel.id,
          `Delivery fee for parcel ${parcel.id}`,
        );
      }

      if (newStatus === ParcelStatus.RETURNED) {
        // Charge back the delivery fee as a return penalty
        // NOTE: charging the full totalFee here — adjust if a partial fee is more fair
        await walletService.debitWallet(
          parcel.merchantId,
          TxType.DEBIT_RETURN_FEE,
          parcel.totalFee,
          parcel.id,
          `Return fee for parcel ${parcel.id}`,
        );
      }
    } catch (error) {
      logger.error({ error, parcelId, newStatus }, 'Failed to update wallet for status change');
      // Do not fail the status transition if wallet update fails
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
