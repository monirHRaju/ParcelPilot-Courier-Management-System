import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { walletService } from '../wallet/wallet.service.js';
import { TxType } from '@prisma/client';
import { getIO } from '../../lib/socket.js';

export const reconciliationService = {
  /**
   * Creates today's reconciliation for the manager's hub, or returns the existing OPEN one.
   */
  async createOrGetReconciliation(hubId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let reconciliation = await prisma.hubReconciliation.findUnique({
      where: {
        hubId_date: {
          hubId,
          date: today,
        },
      },
      include: { items: true },
    });

    if (!reconciliation) {
      reconciliation = await prisma.hubReconciliation.create({
        data: {
          hubId,
          date: today,
        },
        include: { items: true },
      });
    }

    return reconciliation;
  },

  /**
   * Adds a COD collection to the session.
   */
  async addItem(reconciliationId: string, hubId: string, data: { codCollectionId: string; confirmedAmountPaisa: number; note?: string }) {
    const reconciliation = await prisma.hubReconciliation.findUnique({
      where: { id: reconciliationId },
    });

    if (!reconciliation) {
      throw AppError.notFound('Reconciliation not found', 'RECONCILIATION_NOT_FOUND');
    }

    if (reconciliation.status !== 'OPEN') {
      throw AppError.badRequest('Reconciliation is already closed', 'RECONCILIATION_CLOSED');
    }

    if (reconciliation.hubId !== hubId) {
      throw AppError.forbidden('You can only manage reconciliations for your own hub', 'FORBIDDEN');
    }

    const codCollection = await prisma.codCollection.findUnique({
      where: { id: data.codCollectionId },
      include: { parcel: true },
    });

    if (!codCollection) {
      throw AppError.notFound('COD collection not found', 'COD_COLLECTION_NOT_FOUND');
    }

    if (codCollection.parcel.destinationHubId !== hubId) {
      throw AppError.forbidden('This COD collection does not belong to your hub', 'HUB_MISMATCH');
    }
    
    if (codCollection.status !== 'COLLECTED') {
       throw AppError.badRequest('This COD collection is already reconciled or disputed', 'COD_COLLECTION_NOT_COLLECTED');
    }

    // Check if the COD collection is already part of a reconciliation item
    const existingItem = await prisma.hubReconciliationItem.findUnique({
      where: { codCollectionId: data.codCollectionId },
    });

    if (existingItem) {
      throw AppError.badRequest('This COD collection is already in a reconciliation session', 'COD_COLLECTION_ALREADY_IN_RECONCILIATION');
    }

    const isDisputed = codCollection.amountPaisa !== data.confirmedAmountPaisa;

    const item = await prisma.hubReconciliationItem.create({
      data: {
        reconciliationId,
        codCollectionId: data.codCollectionId,
        confirmedAmountPaisa: data.confirmedAmountPaisa,
        isDisputed,
        note: data.note,
      },
    });

    return item;
  },

  /**
   * Closes the session and triggers financial effects.
   */
  async closeReconciliation(reconciliationId: string, userId: string, hubId: string) {
    const reconciliation = await prisma.hubReconciliation.findUnique({
      where: { id: reconciliationId },
      include: {
        items: {
          include: {
            codCollection: {
              include: { parcel: true },
            },
          },
        },
      },
    });

    if (!reconciliation) {
      throw AppError.notFound('Reconciliation not found', 'RECONCILIATION_NOT_FOUND');
    }

    if (reconciliation.status !== 'OPEN') {
      throw AppError.badRequest('Reconciliation is already closed', 'RECONCILIATION_CLOSED');
    }

    if (reconciliation.hubId !== hubId) {
      throw AppError.forbidden('You can only close reconciliations for your own hub', 'FORBIDDEN');
    }

    const closed = await prisma.$transaction(async (tx) => {
      for (const item of reconciliation.items) {
        if (!item.isDisputed) {
          // Update CodCollection
          await tx.codCollection.update({
            where: { id: item.codCollectionId },
            data: {
              status: 'RECONCILED',
              reconciledAt: new Date(),
            },
          });

          // Credit merchant wallet (Note: COD handling fee was priced into codHandlingFee at creation, full amount to merchant)
          await walletService.creditWalletTx(
            tx,
            item.codCollection.parcel.merchantId,
            TxType.CREDIT_COD_COLLECTED,
            item.confirmedAmountPaisa,
            item.codCollection.parcelId,
            `COD reconciled for parcel ${item.codCollection.parcelId}`,
          );
        } else {
          // Update CodCollection status only
          await tx.codCollection.update({
            where: { id: item.codCollectionId },
            data: {
              status: 'DISPUTED',
            },
          });

          // Emit socket notification to merchant
          try {
            const io = getIO();
            const merchantUserId = await tx.merchant.findUnique({
              where: { id: item.codCollection.parcel.merchantId },
              select: { userId: true },
            });
            if (merchantUserId) {
               io.to(`user:${merchantUserId.userId}`).emit('cod:dispute', {
                 parcelId: item.codCollection.parcelId,
                 confirmedAmountPaisa: item.confirmedAmountPaisa,
                 expectedAmountPaisa: item.codCollection.amountPaisa,
               });
            }
          } catch (err) {
            // Socket errors should not fail the transaction
            console.error('Failed to emit cod:dispute socket event', err);
          }
        }
      }

      // Close reconciliation
      return tx.hubReconciliation.update({
        where: { id: reconciliationId },
        data: {
          status: 'CLOSED',
          closedById: userId,
          closedAt: new Date(),
        },
        include: { items: true },
      });
    });

    return closed;
  },

  async getMyHubReconciliations(hubId: string) {
    return prisma.hubReconciliation.findMany({
      where: { hubId },
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
  },

  async getReconciliationDetail(reconciliationId: string, hubId: string) {
    const reconciliation = await prisma.hubReconciliation.findUnique({
      where: { id: reconciliationId },
      include: {
        items: {
          include: {
            codCollection: {
              include: {
                parcel: true,
                rider: { include: { user: true } },
              },
            },
          },
        },
        closedByUser: { select: { phone: true } },
      },
    });

    if (!reconciliation) {
      throw AppError.notFound('Reconciliation not found', 'RECONCILIATION_NOT_FOUND');
    }

    if (reconciliation.hubId !== hubId) {
      throw AppError.forbidden('You can only view reconciliations for your own hub', 'FORBIDDEN');
    }

    return reconciliation;
  },
};
