import { Request, Response, NextFunction } from 'express';
import { walletService } from './wallet.service.js';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';

export const walletController = {
  /**
   * GET /merchants/me/wallet
   * Returns current balance + last 50 transactions.
   */
  async getMyWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;

      const merchant = await prisma.merchant.findUnique({ where: { userId } });
      if (!merchant) {
        throw AppError.notFound('Merchant profile not found', 'MERCHANT_NOT_FOUND');
      }

      const wallet = await walletService.getWalletWithRecentTransactions(merchant.id);

      res.json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /merchants/me/wallet/transactions?page=1&limit=20
   * Paginated full transaction history.
   */
  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;

      const merchant = await prisma.merchant.findUnique({ where: { userId } });
      if (!merchant) {
        throw AppError.notFound('Merchant profile not found', 'MERCHANT_NOT_FOUND');
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

      const result = await walletService.getTransactions(merchant.id, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
