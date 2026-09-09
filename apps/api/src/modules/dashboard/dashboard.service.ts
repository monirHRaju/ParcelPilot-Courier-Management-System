import { prisma } from '../../lib/prisma.js';

export class DashboardService {
  static async getAdminStats() {
    const totalParcels = await prisma.parcel.count();
    
    const deliveredParcels = await prisma.parcel.count({
      where: { status: 'DELIVERED' },
    });

    const revenueResult = await prisma.parcel.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { totalFee: true },
    });
    const totalRevenue = revenueResult._sum.totalFee || 0;

    const codCollectedResult = await prisma.parcel.aggregate({
      where: { 
        status: 'DELIVERED',
        isCodCollected: false,
        paymentType: 'COD'
      },
      _sum: { codAmount: true },
    });
    const totalCodCollected = codCollectedResult._sum.codAmount || 0;

    const recentActivity = await prisma.parcel.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: {
          select: { businessName: true }
        }
      },
    });

    // For volume trends, use Prisma raw query
    const volumeTrendsRaw = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "Parcel"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;
    
    const volumeTrends = (volumeTrendsRaw as any[]).map((row) => ({
      date: new Date(row.date).toISOString().split('T')[0],
      count: Number(row.count)
    }));

    return {
      totalParcels,
      deliveredParcels,
      totalRevenue,
      totalCodCollected,
      recentActivity,
      volumeTrends,
    };
  }

  static async getMerchantStats(userId: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { userId },
      include: { wallet: true }
    });

    if (!merchant) {
      throw new Error('Merchant profile not found');
    }

    const merchantId = merchant.id;
    const walletBalance = merchant.wallet?.balancePaisa || 0;

    const pendingPayoutsResult = await prisma.payoutRequest.aggregate({
      where: { merchantId, status: 'PENDING' },
      _sum: { amountPaisa: true },
    });
    const pendingPayouts = pendingPayoutsResult._sum.amountPaisa || 0;

    const totalParcels = await prisma.parcel.count({
      where: { merchantId },
    });

    const deliveredParcels = await prisma.parcel.count({
      where: { merchantId, status: 'DELIVERED' },
    });

    const returnedParcels = await prisma.parcel.count({
      where: { merchantId, status: 'RETURNED' },
    });
    
    const returnRate = totalParcels > 0 
      ? Number(((returnedParcels / totalParcels) * 100).toFixed(2)) 
      : 0;

    const recentParcels = await prisma.parcel.findMany({
      where: { merchantId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        recipientName: true,
        status: true,
        codAmount: true,
      }
    });

    const statusGroups = await prisma.parcel.groupBy({
      by: ['status'],
      where: { merchantId },
      _count: true,
    });
    
    const statusDistribution = statusGroups.map(g => ({
      status: g.status,
      count: g._count
    }));

    return {
      walletBalance,
      pendingPayouts,
      totalParcels,
      deliveredParcels,
      returnRate,
      recentParcels,
      statusDistribution,
    };
  }
}
