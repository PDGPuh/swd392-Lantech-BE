import { CefrLevel } from '@prisma/client';

/**
 * AI Provider Interface - abstraction layer for AI services
 */
export interface AIProvider {
  name: string;

  /**
   * Generate explanation for a concept in the user's source language
   */
  generateExplanation(params: {
    concept: string;
    sourceLanguageCode: string;
    cefrLevel: CefrLevel;
  }): Promise<string>;

  /**
   * Generate exercises based on topic and level
   */
  generateExercises(params: {
    topic: string;
    cefrLevel: CefrLevel;
    sourceLanguageCode: string;
    count: number;
  }): Promise<GeneratedExercise[]>;

  /**
   * Analyze user's weaknesses based on their mistakes
   */
  analyzeWeaknesses(params: {
    mistakes: Array<{ question: string; userAnswer: string; correctAnswer: string }>;
    sourceLanguageCode: string;
  }): Promise<string>;

  /**
   * Chat tutor - conversational AI for learning
   */
  chatTutor(params: {
    message: string;
    sourceLanguageCode: string;
    cefrLevel: CefrLevel;
    conversationHistory?: Array<{ role: string; content: string }>;
  }): Promise<string>;

  /**
   * Generate a personalized learning path suggestion
   */
  generateLearningPathSuggestion(params: {
    cefrLevel: CefrLevel;
    sourceLanguageCode: string;
  }): Promise<{ title: string; description: string }>;

  /**
   * Analyze pronunciation and provide feedback in source language
   */
  analyzePronunciation(params: {
    targetText: string;
    transcriptText: string;
    sourceLanguageCode: string;
  }): Promise<string | null>;
}

export interface GeneratedExercise {
  type: string;
  prompt: string;
  instruction: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}
