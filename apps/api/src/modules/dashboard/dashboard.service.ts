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
}
