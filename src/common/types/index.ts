import { Role, CefrLevel, Skill, ExerciseType } from '@prisma/client';

export { Role, CefrLevel, Skill, ExerciseType };

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface CefrScoreRange {
  min: number;
  max: number;
  level: CefrLevel;
}

/**
 * CEFR score mapping:
 * 0-20: A1, 21-40: A2, 41-60: B1, 61-80: B2, 81-100: C1
 */
export const CEFR_SCORE_RANGES: CefrScoreRange[] = [
  { min: 0, max: 20, level: 'A1' },
  { min: 21, max: 40, level: 'A2' },
  { min: 41, max: 60, level: 'B1' },
  { min: 61, max: 80, level: 'B2' },
  { min: 81, max: 100, level: 'C1' },
];

export function scoreToCefrLevel(score: number): CefrLevel {
  for (const range of CEFR_SCORE_RANGES) {
    if (score >= range.min && score <= range.max) {
      return range.level;
    }
  }
  return 'A1';
}

/** XP reward constants */
export const XP_REWARDS = {
  EXERCISE_CORRECT: 5,
  EXERCISE_INCORRECT: 1,
  LESSON_COMPLETE: 10,
  FLASHCARD_REVIEW: 2,
  PERFECT_LESSON_BONUS: 15,
  STREAK_BONUS: 5,
} as const;
