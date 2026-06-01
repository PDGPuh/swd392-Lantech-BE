import { Request, Response } from 'express';
import { aiService } from './ai.service';
import prisma from '../../config/prisma';
import { sendSuccess } from '../../common/utils/response';
import { AppError } from '../../common/errors/AppError';

export class AIController {
  async generateExplanation(req: Request, res: Response) {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw AppError.notFound('User not found');
    const sourceLanguageCode = req.body.sourceLanguageCode || user.sourceLanguageCode;
    const result = await aiService.generateExplanation(
      req.body.concept,
      sourceLanguageCode,
      user.currentCefrLevel,
    );
    sendSuccess(res, { explanation: result });
  }

  async generateExercises(req: Request, res: Response) {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw AppError.notFound('User not found');
    const sourceLanguageCode = req.body.sourceLanguageCode || user.sourceLanguageCode;
    const exercises = await aiService.generateExercises(
      req.body.topic,
      user.currentCefrLevel,
      sourceLanguageCode,
      req.body.count,
    );
    sendSuccess(res, { exercises });
  }

  async analyzeWeaknesses(req: Request, res: Response) {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw AppError.notFound('User not found');
    const sourceLanguageCode = req.body.sourceLanguageCode || user.sourceLanguageCode;

    // Get recent incorrect attempts
    const recentMistakes = await prisma.exerciseAttempt.findMany({
      where: { userId: req.user!.userId, isCorrect: false },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { exercise: true },
    });

    const mistakes = recentMistakes.map((m) => ({
      question: m.exercise.prompt,
      userAnswer: m.answer,
      correctAnswer: m.exercise.correctAnswer,
    }));

    const analysis = await aiService.analyzeWeaknesses(mistakes, sourceLanguageCode);
    sendSuccess(res, { analysis, mistakeCount: mistakes.length });
  }

  async chatTutor(req: Request, res: Response) {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw AppError.notFound('User not found');
    const reply = await aiService.chatTutor(
      req.body.message,
      user.sourceLanguageCode,
      user.currentCefrLevel,
      req.body.conversationHistory,
    );
    sendSuccess(res, { reply });
  }
}

export const aiController = new AIController();
