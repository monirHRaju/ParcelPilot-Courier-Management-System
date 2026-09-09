import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { walletService } from '../wallet/wallet.service.js';
import { TxType, PayoutStatus } from '@prisma/client';
import { logger } from '../../lib/logger.js';
import { emailQueue } from '../../lib/queue/queue.js';
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

    // Enqueue payout confirmation email (non-blocking, retryable via EMAIL_QUEUE)
    // TODO Module 9: replace 'MOCK-' reference simulation with real bKash/Nagad Disbursement API call
    try {
      const merchantUser = await prisma.user.findUnique({
        where: { id: merchant.userId },
        select: { email: true },
      });

      if (merchantUser?.email) {
        const amountBdt = (completedPayout.amountPaisa / 100).toFixed(2);
        const processedAt = completedPayout.processedAt?.toISOString() ?? new Date().toISOString();
        await emailQueue.add('payout-confirmation', {
          to: merchantUser.email,
          subject: 'ParcelPilot — Your Payout Has Been Processed',
          html: `
            <h2>Payout Confirmation</h2>
            <p>Your payout request has been successfully processed.</p>
            <table>
              <tr><td><strong>Amount:</strong></td><td>BDT ${amountBdt}</td></tr>
              <tr><td><strong>Method:</strong></td><td>${completedPayout.payoutMethod}</td></tr>
              <tr><td><strong>Reference:</strong></td><td>${completedPayout.reference}</td></tr>
              <tr><td><strong>Processed At:</strong></td><td>${processedAt}</td></tr>
            </table>
            <p>Thank you for using ParcelPilot.</p>
          `,
        });
      } else {
        logger.warn({ merchantId: merchant.id }, '[Payout] No email on file for merchant — payout confirmation email skipped');
      }
    } catch (err) {
      // Email failure must never block a completed payout
      logger.error({ err, payoutId: completedPayout.id }, '[Payout] Failed to enqueue payout confirmation email');
    }

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
