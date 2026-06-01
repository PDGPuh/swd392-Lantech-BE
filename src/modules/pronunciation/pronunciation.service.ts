import prisma from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import { calculateSimilarityScore, getWordLevelFeedback } from '../../common/utils/string';
import { aiService } from '../ai/ai.service';

export class PronunciationService {
  async attempt(
    userId: string,
    data: { exerciseId?: string; targetText: string; transcriptText: string },
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('User not found');

    // Calculate similarity score
    const score = calculateSimilarityScore(data.targetText, data.transcriptText);
    const wordLevelFeedback = getWordLevelFeedback(data.targetText, data.transcriptText);

    // Try to get AI feedback if available
    let feedback = `Score: ${score}/100. `;
    if (score >= 90) {
      feedback += 'Excellent pronunciation!';
    } else if (score >= 70) {
      feedback += 'Good pronunciation with minor errors.';
    } else if (score >= 50) {
      feedback += 'Fair pronunciation. Keep practicing!';
    } else {
      feedback += 'Needs more practice. Try speaking more slowly and clearly.';
    }

    try {
      const aiFeedback = await aiService.analyzePronunciation(
        data.targetText,
        data.transcriptText,
        user.sourceLanguageCode,
      );
      if (aiFeedback) {
        feedback = aiFeedback;
      }
    } catch {
      // AI unavailable, use basic feedback
    }

    // Save attempt
    const attempt = await prisma.pronunciationAttempt.create({
      data: {
        userId,
        exerciseId: data.exerciseId || null,
        targetText: data.targetText,
        transcriptText: data.transcriptText,
        score,
        wordLevelFeedback,
        provider: 'WEB_SPEECH',
      },
    });

    return {
      id: attempt.id,
      score,
      feedback,
      wordLevelFeedback,
    };
  }
}

export const pronunciationService = new PronunciationService();
