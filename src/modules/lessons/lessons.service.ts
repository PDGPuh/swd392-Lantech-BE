import prisma from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import { gamificationService } from '../gamification/gamification.service';

export class LessonsService {
  async findAll(filters: { level?: string; skill?: string; sourceLanguageCode?: string }) {
    const where: Record<string, unknown> = { isPublished: true };
    if (filters.level) where.cefrLevel = filters.level;
    if (filters.skill) where.skill = filters.skill;
    if (filters.sourceLanguageCode) {
      where.OR = [{ sourceLanguageCode: filters.sourceLanguageCode }, { sourceLanguageCode: null }];
    }

    return prisma.lesson.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        cefrLevel: true,
        title: true,
        description: true,
        skill: true,
        orderIndex: true,
        estimatedMinutes: true,
        xpReward: true,
      },
    });
  }

  async findById(id: string, userId?: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            type: true,
            prompt: true,
            instruction: true,
            options: true,
            difficulty: true,
            xpReward: true,
            orderIndex: true,
          },
        },
        ...(userId
          ? {
              lessonProgresses: {
                where: { userId },
                select: { status: true, score: true, completedAt: true },
              },
            }
          : {}),
      },
    });

    if (!lesson) throw AppError.notFound('Lesson not found');
    return lesson;
  }

  async startLesson(userId: string, lessonId: string) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw AppError.notFound('Lesson not found');

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, status: 'IN_PROGRESS' },
      update: { status: 'IN_PROGRESS', updatedAt: new Date() },
    });

    return progress;
  }

  async completeLesson(userId: string, lessonId: string) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw AppError.notFound('Lesson not found');

    // Calculate score from exercise attempts
    const attempts = await prisma.exerciseAttempt.findMany({
      where: {
        userId,
        exercise: { lessonId },
      },
    });

    const totalExercises = await prisma.exercise.count({ where: { lessonId } });
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const score = totalExercises > 0 ? Math.round((correctAttempts / totalExercises) * 100) : 0;
    const isPerfect = score === 100 && totalExercises > 0;

    // Update progress
    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        status: 'COMPLETED',
        score,
        completedAt: new Date(),
      },
      update: {
        status: 'COMPLETED',
        score,
        completedAt: new Date(),
      },
    });

    // Award XP and handle gamification
    await gamificationService.awardXpForLesson(userId, lesson.xpReward, lessonId, isPerfect);
    await gamificationService.updateStreak(userId);
    await gamificationService.checkAndAwardBadges(userId);

    return { progress, score, isPerfect, xpAwarded: lesson.xpReward };
  }
}

export const lessonsService = new LessonsService();
