import prisma from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import { scoreToCefrLevel } from '../../common/types';

export class PlacementService {
  async getQuestions(sourceLanguageCode?: string) {
    const where: Record<string, unknown> = {};
    if (sourceLanguageCode) {
      // Return questions that match the source language OR are universal (null)
      where.OR = [{ sourceLanguageCode }, { sourceLanguageCode: null }];
    }

    const questions = await prisma.placementQuestion.findMany({
      where,
      orderBy: [{ level: 'asc' }, { skill: 'asc' }],
      select: {
        id: true,
        level: true,
        questionText: true,
        options: true,
        skill: true,
        sourceLanguageCode: true,
      },
    });
    return questions;
  }

  async submit(userId: string, answers: Array<{ questionId: string; answer: string }>) {
    // Get user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('User not found');

    // Get questions
    const questionIds = answers.map((a) => a.questionId);
    const questions = await prisma.placementQuestion.findMany({
      where: { id: { in: questionIds } },
    });

    if (questions.length === 0) {
      throw AppError.badRequest('No valid questions found');
    }

    // Calculate score
    let correctCount = 0;
    for (const answer of answers) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (
        question &&
        question.correctAnswer.toLowerCase().trim() === answer.answer.toLowerCase().trim()
      ) {
        correctCount++;
      }
    }

    // Score as percentage (0-100)
    const totalScore = Math.round((correctCount / questions.length) * 100);
    const resultLevel = scoreToCefrLevel(totalScore);

    // Create placement test record
    const placementTest = await prisma.placementTest.create({
      data: {
        userId,
        sourceLanguageCode: user.sourceLanguageCode,
        targetLanguageCode: user.targetLanguageCode,
        resultLevel,
        totalScore,
        completedAt: new Date(),
      },
    });

    // Update user CEFR level
    await prisma.user.update({
      where: { id: userId },
      data: { currentCefrLevel: resultLevel },
    });

    // Create or update active learning path
    await prisma.learningPath.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    await prisma.learningPath.create({
      data: {
        userId,
        cefrLevel: resultLevel,
        sourceLanguageCode: user.sourceLanguageCode,
        targetLanguageCode: user.targetLanguageCode,
        title: `${resultLevel} English Learning Path`,
        description: `Personalized learning path for ${resultLevel} level English learner`,
        isActive: true,
      },
    });

    return {
      placementTest,
      resultLevel,
      totalScore,
      correctCount,
      totalQuestions: questions.length,
    };
  }
}

export const placementService = new PlacementService();
