import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import { walletService } from '../wallet/wallet.service.js';

export const merchantService = {
  async onboardMerchant(userId: string, data: { businessName: string; businessAddress: string; contactPersonName: string }) {
    // Check if the user already has a merchant profile
    const existingMerchant = await prisma.merchant.findUnique({
      where: { userId },
    });

    if (existingMerchant) {
      throw AppError.badRequest('Merchant profile already exists for this user', 'MERCHANT_ALREADY_EXISTS');
    }

    const merchant = await prisma.merchant.create({
      data: {
        userId,
        businessName: data.businessName,
        businessAddress: data.businessAddress,
        contactPersonName: data.contactPersonName,
      },
    });

    // Auto-provision wallet for the new merchant
    await walletService.getOrCreateWallet(merchant.id);

    return merchant;
  },

  async getMyProfile(userId: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            role: true,
            isActive: true,
          }
        }
      }
    });

    if (!merchant) {
      throw AppError.notFound('Merchant profile not found', 'MERCHANT_NOT_FOUND');
    }

    return merchant;
  },

  async updatePayoutMethod(userId: string, payoutMethod: string) {
    const merchant = await prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
      throw AppError.notFound('Merchant profile not found', 'MERCHANT_NOT_FOUND');
    }

    return prisma.merchant.update({
      where: { id: merchant.id },
      data: { payoutMethod },
    });
  },
};
