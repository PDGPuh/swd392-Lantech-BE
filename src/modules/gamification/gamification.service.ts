import prisma from '../../config/prisma';
import { XP_REWARDS } from '../../common/types';

export class GamificationService {
  /**
   * Add XP to user and create transaction record
   */
  async addXp(userId: string, amount: number, reason: string, metadata?: Record<string, unknown>) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: amount } },
      }),
      prisma.xpTransaction.create({
        data: { userId, amount, reason, metadata: (metadata || {}) as any },
      }),
    ]);
  }

  /**
   * Award XP for completing a lesson, with bonus for perfect score
   */
  async awardXpForLesson(userId: string, baseXp: number, lessonId: string, isPerfect: boolean) {
    let totalXp = baseXp;
    await this.addXp(userId, baseXp, 'lesson_complete', { lessonId });

    if (isPerfect) {
      totalXp += XP_REWARDS.PERFECT_LESSON_BONUS;
      await this.addXp(userId, XP_REWARDS.PERFECT_LESSON_BONUS, 'perfect_lesson_bonus', {
        lessonId,
      });
    }

    return totalXp;
  }

  /**
   * Update user streak based on study activity.
   * If user studied yesterday, increment streak.
   * If user studied today already, do nothing.
   * If user missed a day, reset streak to 1.
   */
  async updateStreak(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
    if (lastStudy) {
      lastStudy.setHours(0, 0, 0, 0);
    }

    let newStreak = user.streakCount;

    if (!lastStudy) {
      // First time studying
      newStreak = 1;
    } else {
      const diffDays = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        // Already studied today, no change
        return;
      } else if (diffDays === 1) {
        // Studied yesterday, increment streak
        newStreak += 1;
        // Bonus XP for maintaining streak
        await this.addXp(userId, XP_REWARDS.STREAK_BONUS, 'streak_bonus', { streak: newStreak });
      } else {
        // Missed days, reset streak
        newStreak = 1;
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        streakCount: newStreak,
        lastStudyDate: new Date(),
      },
    });
  }

  /**
   * Check and award badges based on user achievements
   */
  async checkAndAwardBadges(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userBadges: true },
    });
    if (!user) return;

    const earnedBadgeCodes = user.userBadges.map((ub: { badgeId: string }) => ub.badgeId);
    const allBadges = await prisma.badge.findMany();

    for (const badge of allBadges) {
      // Skip if already earned
      const alreadyEarned = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      });
      if (alreadyEarned) continue;

      let shouldAward = false;

      switch (badge.conditionType) {
        case 'FIRST_LESSON': {
          const completedLessons = await prisma.lessonProgress.count({
            where: { userId, status: 'COMPLETED' },
          });
          shouldAward = completedLessons >= badge.conditionValue;
          break;
        }
        case 'STREAK_DAYS': {
          shouldAward = user.streakCount >= badge.conditionValue;
          break;
        }
        case 'TOTAL_XP': {
          shouldAward = user.xp >= badge.conditionValue;
          break;
        }
        case 'FIRST_FLASHCARD_REVIEW': {
          const reviews = await prisma.flashcardReview.count({ where: { userId } });
          shouldAward = reviews >= badge.conditionValue;
          break;
        }
        case 'PERFECT_LESSON': {
          const perfectLessons = await prisma.lessonProgress.count({
            where: { userId, status: 'COMPLETED', score: 100 },
          });
          shouldAward = perfectLessons >= badge.conditionValue;
          break;
        }
      }

      if (shouldAward) {
        await prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
      }
    }
  }

  /**
   * Get user gamification data
   */
  async getMyGamification(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, streakCount: true, lastStudyDate: true },
    });

    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    return { ...user, badges };
  }

  /**
   * Get all available badges
   */
  async getAllBadges(userId: string) {
    const badges = await prisma.badge.findMany();
    const earned = await prisma.userBadge.findMany({ where: { userId } });
    const earnedIds = new Set(earned.map((e: { badgeId: string }) => e.badgeId));

    return badges.map((badge: { id: string }) => ({
      ...badge,
      earned: earnedIds.has(badge.id),
      earnedAt:
        earned.find((e: { badgeId: string; earnedAt: Date }) => e.badgeId === badge.id)?.earnedAt ||
        null,
    }));
  }

  /**
   * Get XP transaction history
   */
  async getXpHistory(userId: string, limit = 50) {
    return prisma.xpTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const gamificationService = new GamificationService();
