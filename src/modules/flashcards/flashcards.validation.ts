import { z } from 'zod';

export const reviewFlashcardSchema = z.object({
  quality: z.number().int().min(0).max(5),
});
