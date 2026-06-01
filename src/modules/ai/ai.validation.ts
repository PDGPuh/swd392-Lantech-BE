import { z } from 'zod';

export const generateExplanationSchema = z.object({
  concept: z.string().min(1),
  sourceLanguageCode: z.string().min(2).max(5).optional(),
});

export const generateExercisesSchema = z.object({
  topic: z.string().min(1),
  count: z.number().int().min(1).max(10).optional().default(3),
  sourceLanguageCode: z.string().min(2).max(5).optional(),
});

export const analyzeWeaknessesSchema = z.object({
  sourceLanguageCode: z.string().min(2).max(5).optional(),
});

export const chatTutorSchema = z.object({
  message: z.string().min(1),
  conversationHistory: z
    .array(
      z.object({
        role: z.string(),
        content: z.string(),
      }),
    )
    .optional(),
});
