import { prisma } from '../../lib/prisma.js';
import { TxType } from '@prisma/client';
import { logger } from '../../lib/logger.js';

export const walletService = {
  /**
   * Finds or creates a wallet for the given merchant. Idempotent.
   */
  async getOrCreateWallet(merchantId: string) {
    let wallet = await prisma.merchantWallet.findUnique({
      where: { merchantId },
    });

    if (!wallet) {
      wallet = await prisma.merchantWallet.create({
        data: { merchantId },
      });
    }

    return wallet;
  },

  /**
   * Credits the merchant wallet (accepts an existing transaction client).
   */
  async creditWalletTx(
    tx: any,
    merchantId: string,
    type: TxType,
    amountPaisa: number,
    parcelId?: string | null,
    note?: string | null,
  ) {
    // Ensure wallet exists
    let wallet = await tx.merchantWallet.findUnique({ where: { merchantId } });
    if (!wallet) {
      wallet = await tx.merchantWallet.create({ data: { merchantId } });
    }

    // Increment balance
    const updated = await tx.merchantWallet.update({
      where: { id: wallet.id },
      data: { balancePaisa: { increment: amountPaisa } },
    });

    // Create immutable ledger entry
    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: updated.id,
        type,
        amountPaisa,
        runningBalance: updated.balancePaisa,
        parcelId: parcelId ?? undefined,
        note: note ?? undefined,
      },
    });

    return transaction;
  },

  /**
   * Credits the merchant wallet within a new serialized transaction.
   * Always stores amountPaisa as a positive integer — direction is encoded in the TxType.
   */
  async creditWallet(
    merchantId: string,
    type: TxType,
    amountPaisa: number,
    parcelId?: string | null,
    note?: string | null,
  ) {
    return prisma.$transaction(async (tx) => {
      return this.creditWalletTx(tx, merchantId, type, amountPaisa, parcelId, note);
    });
  },

  async debitWalletTx(
    tx: any,
    merchantId: string,
    type: TxType,
    amountPaisa: number,
    parcelId?: string | null,
    note?: string | null,
  ) {
    // Ensure wallet exists
    let wallet = await tx.merchantWallet.findUnique({ where: { merchantId } });
    if (!wallet) {
      wallet = await tx.merchantWallet.create({ data: { merchantId } });
    }

    const newBalance = wallet.balancePaisa - amountPaisa;
    if (newBalance < 0) {
      logger.warn(
        { merchantId, currentBalance: wallet.balancePaisa, debitAmount: amountPaisa, newBalance },
        'Merchant wallet going negative after debit',
      );
    }

    // Decrement balance
    const updated = await tx.merchantWallet.update({
      where: { id: wallet.id },
      data: { balancePaisa: { decrement: amountPaisa } },
    });

    // Create immutable ledger entry
    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: updated.id,
        type,
        amountPaisa,
        runningBalance: updated.balancePaisa,
        parcelId: parcelId ?? undefined,
        note: note ?? undefined,
      },
    });

    return transaction;
  },

  /**
   * Debits the merchant wallet within a new serialized transaction.
   */
  async debitWallet(
    merchantId: string,
    type: TxType,
    amountPaisa: number,
    parcelId?: string | null,
    note?: string | null,
  ) {
    return prisma.$transaction(async (tx) => {
      return this.debitWalletTx(tx, merchantId, type, amountPaisa, parcelId, note);
    });
  },

  /**
   * Returns the wallet and its last N transactions.
   */
  async getWalletWithRecentTransactions(merchantId: string, limit = 50) {
    const wallet = await this.getOrCreateWallet(merchantId);

    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { ...wallet, transactions };
  },

  /**
   * Paginated full transaction history.
   */
  async getTransactions(merchantId: string, page = 1, limit = 20) {
    const wallet = await this.getOrCreateWallet(merchantId);

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
