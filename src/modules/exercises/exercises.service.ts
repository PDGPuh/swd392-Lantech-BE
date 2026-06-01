import prisma from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import { XP_REWARDS } from '../../common/types';
import { gamificationService } from '../gamification/gamification.service';

export class ExercisesService {
  async getByLesson(lessonId: string) {
    const exercises = await prisma.exercise.findMany({
      where: { lessonId },
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
        targetText: true,
      },
    });
    return exercises;
  }

  async submit(userId: string, exerciseId: string, answer: string) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: { lesson: true },
    });
    if (!exercise) throw AppError.notFound('Exercise not found');

    // Check correctness based on exercise type
    const isCorrect = this.checkAnswer(exercise.correctAnswer, answer, exercise.type);
    const score = isCorrect ? exercise.xpReward : 0;
    const feedback = isCorrect
      ? 'Correct! Well done.'
      : `Incorrect. The correct answer is: ${exercise.correctAnswer}`;

    // Save attempt
    const attempt = await prisma.exerciseAttempt.create({
      data: {
        userId,
        exerciseId,
        answer,
        isCorrect,
        score,
        feedback: exercise.explanation || feedback,
      },
    });

    // Award XP
    const xpAmount = isCorrect ? XP_REWARDS.EXERCISE_CORRECT : XP_REWARDS.EXERCISE_INCORRECT;
    await gamificationService.addXp(
      userId,
      xpAmount,
      `exercise_${isCorrect ? 'correct' : 'incorrect'}`,
      {
        exerciseId,
      },
    );

    return {
      attemptId: attempt.id,
      isCorrect,
      score,
      feedback: attempt.feedback,
      correctAnswer: isCorrect ? undefined : exercise.correctAnswer,
      explanation: exercise.explanation,
    };
  }

  private checkAnswer(correctAnswer: string, userAnswer: string, _type: string): boolean {
    // Normalize both answers for comparison
    const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
    return normalize(correctAnswer) === normalize(userAnswer);
  }
}

export const exercisesService = new ExercisesService();
