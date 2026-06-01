import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const updateSourceLanguageSchema = z.object({
  sourceLanguageCode: z.string().min(2).max(5),
});

export const updateTargetLevelSchema = z.object({
  currentCefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']),
});
