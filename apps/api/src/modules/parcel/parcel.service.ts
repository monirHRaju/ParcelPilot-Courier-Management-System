import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { SizeTier, ServiceType, Role } from '@prisma/client';

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

    const parcel = await prisma.parcel.create({
      data: {
        merchant: { connect: { id: merchant.id } },
        ...parcelData,
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

    return { parcel: result[0], history: result[1] };
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
};
