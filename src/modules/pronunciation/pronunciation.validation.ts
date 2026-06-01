import { z } from 'zod';

export const pronunciationAttemptSchema = z.object({
  exerciseId: z.string().uuid().optional(),
  targetText: z.string().min(1, 'Target text is required'),
  transcriptText: z.string().min(1, 'Transcript text is required'),
});
