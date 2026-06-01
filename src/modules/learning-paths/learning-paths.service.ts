import prisma from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import { aiService } from '../ai/ai.service';

export class LearningPathsService {
  async getMyPath(userId: string) {
    const path = await prisma.learningPath.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!path) {
      throw AppError.notFound(
        'No active learning path found. Please take the placement test first.',
      );
    }

    // Get recommended lessons for this path
    const lessons = await prisma.lesson.findMany({
      where: {
        cefrLevel: path.cefrLevel,
        isPublished: true,
      },
      orderBy: { orderIndex: 'asc' },
      include: {
        lessonProgresses: {
          where: { userId },
          select: { status: true, score: true, completedAt: true },
        },
      },
    });

    return { path, lessons };
  }

  async generate(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('User not found');

    // Deactivate old paths
    await prisma.learningPath.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Try AI-generated path, fallback to rule-based
    let title = `${user.currentCefrLevel} English Learning Path`;
    let description = `Personalized path based on your ${user.currentCefrLevel} level`;

    try {
      const aiSuggestion = await aiService.generateLearningPath(
        user.currentCefrLevel,
        user.sourceLanguageCode,
      );
      if (aiSuggestion.title) title = aiSuggestion.title;
      if (aiSuggestion.description) description = aiSuggestion.description;
    } catch {
      // AI unavailable, use defaults
    }

    const path = await prisma.learningPath.create({
      data: {
        userId,
        cefrLevel: user.currentCefrLevel,
        sourceLanguageCode: user.sourceLanguageCode,
        targetLanguageCode: user.targetLanguageCode,
        title,
        description,
        isActive: true,
      },
    });

    return path;
  }
}

export const learningPathsService = new LearningPathsService();
