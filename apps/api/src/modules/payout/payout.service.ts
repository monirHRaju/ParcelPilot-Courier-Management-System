import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { walletService } from '../wallet/wallet.service.js';
import { TxType, PayoutStatus } from '@prisma/client';
import { logger } from '../../lib/logger.js';
import crypto from 'crypto';

export const payoutService = {
  async requestPayout(userId: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { userId },
      include: { wallet: true },
    });

    if (!merchant) {
      throw AppError.notFound('Merchant profile not found', 'MERCHANT_NOT_FOUND');
    }

    if (!merchant.payoutMethod) {
      throw AppError.badRequest('Payout method not set', 'PAYOUT_METHOD_NOT_SET');
    }

    if (!merchant.wallet || merchant.wallet.balancePaisa <= 0) {
      throw AppError.badRequest('Wallet balance must be greater than zero', 'INSUFFICIENT_BALANCE');
    }

    const pendingPayout = await prisma.payoutRequest.findFirst({
      where: {
        merchantId: merchant.id,
        status: { in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING] },
      },
    });

    if (pendingPayout) {
      throw AppError.badRequest('A payout is already pending or processing', 'PAYOUT_ALREADY_IN_PROGRESS');
    }

    const amountPaisa = merchant.wallet.balancePaisa;

    const payout = await prisma.$transaction(async (tx) => {
      const payoutRequest = await tx.payoutRequest.create({
        data: {
          merchantId: merchant.id,
          amountPaisa,
          status: PayoutStatus.PROCESSING,
          payoutMethod: merchant.payoutMethod as string,
        },
      });

      await walletService.debitWalletTx(
        tx,
        merchant.id,
        TxType.DEBIT_PAYOUT,
        amountPaisa,
        null,
        `Payout request #${payoutRequest.id}`,
      );

      return payoutRequest;
    });

    // Simulate transfer
    logger.info(`[PAYOUT] Sending ${amountPaisa} paisa to ${merchant.payoutMethod} for merchant ${merchant.id}`);
    
    // Complete the payout
    const completedPayout = await prisma.payoutRequest.update({
      where: { id: payout.id },
      data: {
        status: PayoutStatus.COMPLETED,
        processedAt: new Date(),
        reference: 'MOCK-' + crypto.randomUUID(),
      },
    });

    return completedPayout;
  },

  async getMyPayouts(userId: string) {
    const merchant = await prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
      throw AppError.notFound('Merchant profile not found', 'MERCHANT_NOT_FOUND');
    }

    return prisma.payoutRequest.findMany({
      where: { merchantId: merchant.id },
      orderBy: { requestedAt: 'desc' },
    });
  },

  async getAdminPayouts(status?: string) {
    const filter = status ? { status: status as PayoutStatus } : {};
    return prisma.payoutRequest.findMany({
      where: filter,
      include: {
        merchant: {
          include: { user: { select: { phone: true } } },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });
  },

  async updateAdminPayout(id: string, data: { status: PayoutStatus; reference?: string; failureReason?: string }) {
    const payout = await prisma.payoutRequest.findUnique({ where: { id } });
    if (!payout) {
      throw AppError.notFound('Payout request not found', 'PAYOUT_NOT_FOUND');
    }

    const updateData: any = { status: data.status };
    if (data.reference !== undefined) updateData.reference = data.reference;
    if (data.failureReason !== undefined) updateData.failureReason = data.failureReason;
    if (data.status === PayoutStatus.COMPLETED || data.status === PayoutStatus.FAILED) {
      updateData.processedAt = new Date();
    }

    const updatedPayout = await prisma.payoutRequest.update({
      where: { id },
      data: updateData,
    });

    logger.info(`[ADMIN PAYOUT] Updated payout ${id} to ${data.status}`);
    return updatedPayout;
  },
};
