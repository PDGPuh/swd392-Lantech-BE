import { AIProvider, GeneratedExercise } from '../ai.provider';
import { CefrLevel } from '@prisma/client';

/**
 * Mock AI Provider - returns static responses when no real AI key is available.
 * This ensures the app works without any API keys.
 */
export class MockAIProvider implements AIProvider {
  name = 'mock';

  async generateExplanation(params: {
    concept: string;
    sourceLanguageCode: string;
    cefrLevel: CefrLevel;
  }): Promise<string> {
    const langMap: Record<string, string> = {
      vi: `[Mock AI] Giải thích về "${params.concept}" cho level ${params.cefrLevel}: Đây là một khái niệm quan trọng trong tiếng Anh.`,
      ja: `[Mock AI] 「${params.concept}」についての説明 (${params.cefrLevel}レベル): これは英語の重要な概念です。`,
      ko: `[Mock AI] "${params.concept}"에 대한 설명 (${params.cefrLevel} 레벨): 이것은 영어의 중요한 개념입니다.`,
      zh: `[Mock AI] "${params.concept}" 解释 (${params.cefrLevel}级): 这是英语中的一个重要概念。`,
    };
    return (
      langMap[params.sourceLanguageCode] ||
      `[Mock AI] Explanation for "${params.concept}" at ${params.cefrLevel} level.`
    );
  }

  async generateExercises(params: {
    topic: string;
    cefrLevel: CefrLevel;
    sourceLanguageCode: string;
    count: number;
  }): Promise<GeneratedExercise[]> {
    const exercises: GeneratedExercise[] = [];
    for (let i = 0; i < Math.min(params.count, 3); i++) {
      exercises.push({
        type: 'MULTIPLE_CHOICE',
        prompt: `[Mock] Question ${i + 1} about ${params.topic} (${params.cefrLevel})`,
        instruction: 'Choose the correct answer',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: `[Mock] Mock exercise for topic "${params.topic}".`,
      });
    }
    return exercises;
  }

  async analyzeWeaknesses(params: {
    mistakes: Array<{ question: string; userAnswer: string; correctAnswer: string }>;
    sourceLanguageCode: string;
  }): Promise<string> {
    return `[Mock AI] You made ${params.mistakes.length} mistakes. Review related topics to improve.`;
  }

  async chatTutor(params: {
    message: string;
    sourceLanguageCode: string;
    cefrLevel: CefrLevel;
  }): Promise<string> {
    return `[Mock AI] I received your message: "${params.message}". This is a mock response. Configure a real AI provider for actual tutoring.`;
  }

  async generateLearningPathSuggestion(params: {
    cefrLevel: CefrLevel;
    sourceLanguageCode: string;
  }): Promise<{ title: string; description: string }> {
    return {
      title: `${params.cefrLevel} English Learning Path`,
      description: `A personalized learning path for ${params.cefrLevel} level English learners. [Mock AI - configure real provider for personalized suggestions]`,
    };
  }

  async analyzePronunciation(params: {
    targetText: string;
    transcriptText: string;
    sourceLanguageCode: string;
  }): Promise<string | null> {
    return `[Mock AI] Pronunciation feedback for "${params.targetText}". Configure a real AI provider for detailed analysis.`;
  }
}
