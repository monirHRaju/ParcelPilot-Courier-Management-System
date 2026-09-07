import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { SizeTier, ServiceType, Role } from '@prisma/client';

type CreateParcelData = {
  recipientName: string;
  recipientPhone: string;
  pickupAddressText: string;
  deliveryAddressText: string;
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

    const parcel = await prisma.parcel.create({
      data: {
        merchantId: merchant.id,
        ...data,
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
    });

    return parcels;
  },

  async getParcelById(id: string, user: { id: string; role: string }) {
    const parcel = await prisma.parcel.findUnique({
      where: { id },
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
};
