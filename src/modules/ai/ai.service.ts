import { CefrLevel } from '@prisma/client';
import { env } from '../../config/env';
import { AIProvider, GeneratedExercise } from './ai.provider';
import { MockAIProvider } from './providers/mock.provider';
import { OpenRouterAIProvider } from './providers/openrouter.provider';

/**
 * AI Service - uses provider pattern to support multiple AI backends.
 * Falls back to MockAIProvider if no real provider is configured.
 */
export class AIService {
  private provider: AIProvider;

  constructor() {
    this.provider = this.resolveProvider();
    console.log(`AI Provider initialized: ${this.provider.name}`);
  }

  private resolveProvider(): AIProvider {
    switch (env.AI_PROVIDER) {
      case 'openrouter':
        if (env.OPENROUTER_API_KEY) {
          return new OpenRouterAIProvider();
        }
        console.warn('OpenRouter selected but no API key. Falling back to mock.');
        return new MockAIProvider();
      case 'gemini':
        if (env.GEMINI_API_KEY) {
          // TODO: Implement GeminiProvider when key is available
          console.warn('Gemini provider selected but not yet implemented. Using mock.');
          return new MockAIProvider();
        }
        console.warn('Gemini selected but no API key. Falling back to mock.');
        return new MockAIProvider();
      case 'claude':
        if (env.CLAUDE_API_KEY) {
          console.warn('Claude provider selected but not yet implemented. Using mock.');
          return new MockAIProvider();
        }
        console.warn('Claude selected but no API key. Falling back to mock.');
        return new MockAIProvider();
      case 'openai':
        if (env.OPENAI_API_KEY) {
          console.warn('OpenAI provider selected but not yet implemented. Using mock.');
          return new MockAIProvider();
        }
        console.warn('OpenAI selected but no API key. Falling back to mock.');
        return new MockAIProvider();
      default:
        // Automatically use openrouter if the key is available and no other provider is successfully chosen
        if (env.OPENROUTER_API_KEY) {
          return new OpenRouterAIProvider();
        }
        return new MockAIProvider();
    }
  }

  async generateExplanation(
    concept: string,
    sourceLanguageCode: string,
    cefrLevel: CefrLevel,
  ): Promise<string> {
    return this.provider.generateExplanation({ concept, sourceLanguageCode, cefrLevel });
  }

  async generateExercises(
    topic: string,
    cefrLevel: CefrLevel,
    sourceLanguageCode: string,
    count = 3,
  ): Promise<GeneratedExercise[]> {
    return this.provider.generateExercises({ topic, cefrLevel, sourceLanguageCode, count });
  }

  async analyzeWeaknesses(
    mistakes: Array<{ question: string; userAnswer: string; correctAnswer: string }>,
    sourceLanguageCode: string,
  ): Promise<string> {
    return this.provider.analyzeWeaknesses({ mistakes, sourceLanguageCode });
  }

  async chatTutor(
    message: string,
    sourceLanguageCode: string,
    cefrLevel: CefrLevel,
    conversationHistory?: Array<{ role: string; content: string }>,
  ): Promise<string> {
    return this.provider.chatTutor({ message, sourceLanguageCode, cefrLevel, conversationHistory });
  }

  async generateLearningPath(
    cefrLevel: CefrLevel,
    sourceLanguageCode: string,
  ): Promise<{ title: string; description: string }> {
    return this.provider.generateLearningPathSuggestion({ cefrLevel, sourceLanguageCode });
  }

  async analyzePronunciation(
    targetText: string,
    transcriptText: string,
    sourceLanguageCode: string,
  ): Promise<string | null> {
    return this.provider.analyzePronunciation({ targetText, transcriptText, sourceLanguageCode });
  }
}

export const aiService = new AIService();
