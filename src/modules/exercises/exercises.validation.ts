import { z } from 'zod';

export const submitAnswerSchema = z.object({
  answer: z.string().min(1, 'Answer is required'),
});
