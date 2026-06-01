import prisma from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import { gamificationService } from '../gamification/gamification.service';
import { XP_REWARDS } from '../../common/types';

/**
 * SM-2 Spaced Repetition Algorithm
 *
 * quality: 0-5 rating of recall quality
 *   0 = complete blackout
 *   1 = incorrect, but remembered upon seeing answer
 *   2 = incorrect, but answer seemed easy to recall
 *   3 = correct with serious difficulty
 *   4 = correct after hesitation
 *   5 = perfect recall
 *
 * If quality < 3: reset repetition to 0, interval to 1
 * If quality >= 3:
 *   rep 1: interval = 1
 *   rep 2: interval = 6
 *   rep > 2: interval = round(interval * easeFactor)
 *
 * easeFactor = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * Minimum easeFactor: 1.3
 */
export class FlashcardsService {
  async getDueCards(userId: string) {
    const now = new Date();
    const flashcards = await prisma.flashcard.findMany({
      where: {
        userId,
        dueDate: { lte: now },
      },
      include: {
        vocabulary: {
          include: { translations: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return flashcards;
  }

  async createFromVocabulary(userId: string, vocabularyId: string) {
    // Verify vocabulary exists
    const vocabulary = await prisma.vocabulary.findUnique({ where: { id: vocabularyId } });
    if (!vocabulary) throw AppError.notFound('Vocabulary not found');

    // Get user's source language
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('User not found');

    // Check if flashcard already exists
    const existing = await prisma.flashcard.findUnique({
      where: { userId_vocabularyId: { userId, vocabularyId } },
    });
    if (existing) throw AppError.conflict('Flashcard already exists for this vocabulary');

    const flashcard = await prisma.flashcard.create({
      data: {
        userId,
        vocabularyId,
        sourceLanguageCode: user.sourceLanguageCode,
        dueDate: new Date(), // Due immediately for first review
      },
      include: {
        vocabulary: {
          include: { translations: true },
        },
      },
    });

    return flashcard;
  }

  async review(userId: string, flashcardId: string, quality: number) {
    const flashcard = await prisma.flashcard.findFirst({
      where: { id: flashcardId, userId },
    });
    if (!flashcard) throw AppError.notFound('Flashcard not found');

    // Apply SM-2 algorithm
    const oldInterval = flashcard.interval;
    const oldEaseFactor = flashcard.easeFactor;
    let newInterval: number;
    let newRepetition: number;
    let newEaseFactor: number;

    if (quality < 3) {
      // Failed recall - reset
      newRepetition = 0;
      newInterval = 1;
      newEaseFactor = oldEaseFactor; // Keep ease factor on failure
    } else {
      // Successful recall
      newRepetition = flashcard.repetition + 1;
      if (newRepetition === 1) {
        newInterval = 1;
      } else if (newRepetition === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(oldInterval * oldEaseFactor);
      }
      newEaseFactor = oldEaseFactor;
    }

    // Update ease factor (always, regardless of quality)
    newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor); // Minimum 1.3

    // Calculate next due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + newInterval);

    // Update flashcard
    const updated = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        interval: newInterval,
        repetition: newRepetition,
        easeFactor: newEaseFactor,
        dueDate,
        lastReviewedAt: new Date(),
      },
    });

    // Create review record
    await prisma.flashcardReview.create({
      data: {
        flashcardId,
        userId,
        quality,
        oldInterval,
        newInterval,
        oldEaseFactor,
        newEaseFactor,
      },
    });

    // Award XP for review
    await gamificationService.addXp(userId, XP_REWARDS.FLASHCARD_REVIEW, 'flashcard_review', {
      flashcardId,
      quality,
    });

    // Check for first flashcard review badge
    await gamificationService.checkAndAwardBadges(userId);

    return {
      flashcard: updated,
      review: {
        quality,
        oldInterval,
        newInterval,
        oldEaseFactor,
        newEaseFactor,
        nextDueDate: dueDate,
      },
    };
  }
}

export const flashcardsService = new FlashcardsService();
