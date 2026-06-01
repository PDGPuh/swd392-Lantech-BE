import { z } from 'zod';

export const getQuestionsSchema = z.object({
  sourceLanguageCode: z.string().min(2).max(5).optional(),
});

export const submitPlacementSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        answer: z.string().min(1),
      }),
    )
    .min(1, 'At least one answer is required'),
});
