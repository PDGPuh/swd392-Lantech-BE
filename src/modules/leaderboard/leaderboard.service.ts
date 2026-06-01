import prisma from '../../config/prisma';

export class LeaderboardService {
  async getWeekly(limit = 20) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const results = await prisma.xpTransaction.groupBy({
      by: ['userId'],
      _sum: { amount: true },
      where: { createdAt: { gte: weekAgo } },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    const userIds = results.map((r) => r.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true, avatarUrl: true, currentCefrLevel: true },
    });

    return results.map((r, index) => {
      const user = users.find((u) => u.id === r.userId);
      return {
        rank: index + 1,
        userId: r.userId,
        fullName: user?.fullName || 'Unknown',
        avatarUrl: user?.avatarUrl,
        cefrLevel: user?.currentCefrLevel,
        xp: r._sum.amount || 0,
      };
    });
  }

  async getMonthly(limit = 20) {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const results = await prisma.xpTransaction.groupBy({
      by: ['userId'],
      _sum: { amount: true },
      where: { createdAt: { gte: monthAgo } },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    const userIds = results.map((r) => r.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true, avatarUrl: true, currentCefrLevel: true },
    });

    return results.map((r, index) => {
      const user = users.find((u) => u.id === r.userId);
      return {
        rank: index + 1,
        userId: r.userId,
        fullName: user?.fullName || 'Unknown',
        avatarUrl: user?.avatarUrl,
        cefrLevel: user?.currentCefrLevel,
        xp: r._sum.amount || 0,
      };
    });
  }

  async getAllTime(limit = 20) {
    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: limit,
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        currentCefrLevel: true,
        xp: true,
      },
    });

    return users.map((u, index) => ({
      rank: index + 1,
      userId: u.id,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl,
      cefrLevel: u.currentCefrLevel,
      xp: u.xp,
    }));
  }
}

export const leaderboardService = new LeaderboardService();
