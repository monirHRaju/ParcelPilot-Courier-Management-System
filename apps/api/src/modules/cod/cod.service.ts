import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';

export const codService = {
  /**
   * Records a rider collecting COD cash on a parcel.
   * Does NOT credit the merchant wallet — that happens at hub reconciliation (5.3).
   */
  async collectCod(parcelId: string, userId: string, amountPaisa: number, note?: string) {
    // Get the rider profile for this user
    const rider = await prisma.rider.findUnique({ where: { userId } });
    if (!rider) {
      throw AppError.forbidden('Rider profile not found', 'RIDER_NOT_FOUND');
    }

    // Fetch the parcel
    const parcel = await prisma.parcel.findUnique({ where: { id: parcelId } });
    if (!parcel) {
      throw AppError.notFound('Parcel not found', 'PARCEL_NOT_FOUND');
    }

    // Guard: must be a COD parcel
    if (parcel.codAmount <= 0) {
      throw AppError.badRequest('This is not a COD parcel', 'NOT_COD_PARCEL');
    }

    // Guard: must be OUT_FOR_DELIVERY
    if (parcel.status !== 'OUT_FOR_DELIVERY') {
      throw AppError.badRequest(
        `Cannot collect COD — parcel status is ${parcel.status}, expected OUT_FOR_DELIVERY`,
        'INVALID_PARCEL_STATUS',
      );
    }

    // Guard: rider can only collect on their own assigned parcels
    if (parcel.riderId !== rider.id) {
      throw AppError.forbidden('You can only collect COD on parcels assigned to you', 'NOT_YOUR_PARCEL');
    }

    // Guard: prevent double-collection
    if (parcel.isCodCollected) {
      throw AppError.badRequest('COD has already been collected for this parcel', 'ALREADY_COLLECTED');
    }

    // Create the CodCollection record and update parcel flag in a transaction
    const [codCollection] = await prisma.$transaction([
      prisma.codCollection.create({
        data: {
          parcelId,
          riderId: rider.id,
          amountPaisa,
          note,
        },
      }),
      prisma.parcel.update({
        where: { id: parcelId },
        data: { isCodCollected: true },
      }),
    ]);

    return codCollection;
  },

  /**
   * Returns a rider's own COD collection history.
   */
  async getRiderCollections(userId: string) {
    const rider = await prisma.rider.findUnique({ where: { userId } });
    if (!rider) {
      throw AppError.forbidden('Rider profile not found', 'RIDER_NOT_FOUND');
    }

    return prisma.codCollection.findMany({
      where: { riderId: rider.id },
      orderBy: { collectedAt: 'desc' },
      include: {
        parcel: {
          select: { id: true, recipientName: true, codAmount: true },
        },
      },
    });
  },

  /**
   * Returns all unreconciled (COLLECTED) COD collections for a hub manager's hub.
   */
  async getPendingCodForHub(userId: string) {
    // Find which hub this manager belongs to
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.hubId) {
      throw AppError.forbidden('You are not assigned to a hub', 'NO_HUB_ASSIGNMENT');
    }

    return prisma.codCollection.findMany({
      where: {
        status: 'COLLECTED',
        parcel: { destinationHubId: user.hubId },
      },
      orderBy: { collectedAt: 'desc' },
      include: {
        parcel: {
          select: { id: true, recipientName: true, codAmount: true },
        },
        rider: {
          select: {
            id: true,
            user: { select: { phone: true } },
          },
        },
      },
    });
  },
};
