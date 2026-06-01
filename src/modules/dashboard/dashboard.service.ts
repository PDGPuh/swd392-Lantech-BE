import prisma from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';

export class DashboardService {
  async getMyDashboard(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        currentCefrLevel: true,
        xp: true,
        streakCount: true,
        lastStudyDate: true,
        sourceLanguageCode: true,
      },
    });
    if (!user) throw AppError.notFound('User not found');

    // Lessons completed
    const lessonsCompleted = await prisma.lessonProgress.count({
      where: { userId, status: 'COMPLETED' },
    });

    // Exercises completed
    const exercisesCompleted = await prisma.exerciseAttempt.count({
      where: { userId },
    });

    // Correct exercises
    const exercisesCorrect = await prisma.exerciseAttempt.count({
      where: { userId, isCorrect: true },
    });

    // Skill breakdown from exercise attempts
    const skillBreakdown = await prisma.exerciseAttempt.groupBy({
      by: ['exerciseId'],
      where: { userId },
      _count: { id: true },
      _sum: { score: true },
    });

    // Due flashcards count
    const dueFlashcards = await prisma.flashcard.count({
      where: { userId, dueDate: { lte: new Date() } },
    });

    // Recent activity (last 10 XP transactions)
    const recentActivity = await prisma.xpTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get lesson progress by skill for breakdown
    const lessonsBySkill = await prisma.lessonProgress.findMany({
      where: { userId, status: 'COMPLETED' },
      include: { lesson: { select: { skill: true } } },
    });

    const skillStats: Record<string, number> = {};
    for (const lp of lessonsBySkill) {
      const skill = lp.lesson.skill;
      skillStats[skill] = (skillStats[skill] || 0) + 1;
    }

    // Recommended next lessons (lessons not started at user's level)
    const recommendedLessons = await prisma.lesson.findMany({
      where: {
        cefrLevel: user.currentCefrLevel,
        isPublished: true,
        NOT: {
          lessonProgresses: {
            some: { userId, status: 'COMPLETED' },
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        skill: true,
        estimatedMinutes: true,
        xpReward: true,
      },
    });

    return {
      currentLevel: user.currentCefrLevel,
      totalXp: user.xp,
      streak: user.streakCount,
      lastStudyDate: user.lastStudyDate,
      lessonsCompleted,
      exercisesCompleted,
      exercisesCorrect,
      accuracy:
        exercisesCompleted > 0 ? Math.round((exercisesCorrect / exercisesCompleted) * 100) : 0,
      skillBreakdown: skillStats,
      dueFlashcardsCount: dueFlashcards,
      recentActivity,
      recommendedNextLessons: recommendedLessons,
    };
  }
}

export const dashboardService = new DashboardService();
