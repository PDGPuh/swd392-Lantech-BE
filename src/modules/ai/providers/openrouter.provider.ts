import { AIProvider, GeneratedExercise } from '../ai.provider';
import { CefrLevel } from '@prisma/client';
import { env } from '../../../config/env';
import { AppError } from '../../../common/errors/AppError';

export class OpenRouterAIProvider implements AIProvider {
  name = 'openrouter';

  private async callModel(systemPrompt: string, userPrompt: string, jsonMode = false): Promise<string> {
    if (!env.OPENROUTER_API_KEY) {
      throw new AppError('OpenRouter API Key is not configured', 500);
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://github.com/PDGPuh/lantech-backend',
          'X-Title': 'Lantech Backend',
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL || 'google/gemini-2.5-flash:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: jsonMode ? { type: 'json_object' } : undefined,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouter API error (status ${response.status}):`, errorText);
        throw new AppError(`AI service returned error: ${response.statusText}`, 502);
      }

      const data = (await response.json()) as any;
      const reply = data?.choices?.[0]?.message?.content;
      if (!reply) {
        throw new AppError('AI service did not return a valid response choice', 502);
      }

      return reply.trim();
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Error calling OpenRouter:', error);
      throw new AppError(`Failed to communicate with AI Service: ${error.message}`, 502);
    }
  }

  private cleanJsonString(str: string): string {
    // Strip markdown code block wrapper if present
    let cleaned = str.trim();
    if (cleaned.startsWith('```')) {
      // Find first newline
      const firstNewline = cleaned.indexOf('\n');
      if (firstNewline !== -1) {
        cleaned = cleaned.slice(firstNewline + 1);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
      }
    }
    return cleaned.trim();
  }

  async generateExplanation(params: {
    concept: string;
    sourceLanguageCode: string;
    cefrLevel: CefrLevel;
  }): Promise<string> {
    const systemPrompt = `You are a helpful and experienced English language teacher.
Your goal is to explain English concepts, grammar rules, vocabulary, or idioms to learners.
Explain the concepts clearly, provide practical examples, and tailor your explanation to the user's CEFR level: ${params.cefrLevel}.
Make sure to explain it in the user's source language (language code: ${params.sourceLanguageCode}).`;

    const userPrompt = `Please explain the English concept: "${params.concept}" in detail, with examples suitable for the CEFR level ${params.cefrLevel}.`;

    return this.callModel(systemPrompt, userPrompt, false);
  }

  async generateExercises(params: {
    topic: string;
    cefrLevel: CefrLevel;
    sourceLanguageCode: string;
    count: number;
  }): Promise<GeneratedExercise[]> {
    const systemPrompt = `You are an English test generator. Your goal is to generate high-quality English exercises.
Generate exactly ${params.count} exercises for the topic: "${params.topic}" at CEFR level ${params.cefrLevel}.
The instructions and explanations in the exercises should be written in the user's native language (language code: ${params.sourceLanguageCode}).
You must respond with ONLY a raw JSON array matching this format (no other text, no markdown wrappers except raw JSON):
[
  {
    "type": "MULTIPLE_CHOICE",
    "prompt": "The prompt/question in English, e.g. 'She ___ to the market yesterday.'",
    "instruction": "Instructions in native language, e.g. 'Chọn đáp án đúng nhất'",
    "options": ["goes", "went", "gone", "going"],
    "correctAnswer": "went",
    "explanation": "Detailed explanation of why this is correct and why other choices are wrong, in native language."
  }
]`;

    const userPrompt = `Generate exactly ${params.count} exercises about "${params.topic}" for CEFR Level ${params.cefrLevel} with instructions and explanations in language code "${params.sourceLanguageCode}".`;

    const reply = await this.callModel(systemPrompt, userPrompt, true);
    try {
      const cleanJson = this.cleanJsonString(reply);
      const parsed = JSON.parse(cleanJson);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e: any) {
      console.error('Failed to parse exercises JSON from OpenRouter response:', reply, e);
      throw new AppError('AI generated invalid exercise format', 502);
    }
  }

  async analyzeWeaknesses(params: {
    mistakes: Array<{ question: string; userAnswer: string; correctAnswer: string }>;
    sourceLanguageCode: string;
  }): Promise<string> {
    const systemPrompt = `You are an English language tutor analyzing a student's mistakes.
Analyze their mistakes, identify the underlying weaknesses, and provide constructive suggestions to help them improve.
Provide this analysis in the user's native language (language code: ${params.sourceLanguageCode}).`;

    const userPrompt = `Here are the questions I made mistakes on:
${JSON.stringify(params.mistakes, null, 2)}

Analyze my weaknesses and give me feedback and suggestions on how to improve.`;

    return this.callModel(systemPrompt, userPrompt, false);
  }

  async chatTutor(params: {
    message: string;
    sourceLanguageCode: string;
    cefrLevel: CefrLevel;
    conversationHistory?: Array<{ role: string; content: string }>;
  }): Promise<string> {
    if (!env.OPENROUTER_API_KEY) {
      throw new AppError('OpenRouter API Key is not configured', 500);
    }

    const systemPrompt = `You are a friendly and encouraging English virtual tutor. 
You are having a conversation with an English learner at CEFR level ${params.cefrLevel}.
Chat with them naturally. If they write in English with grammatical mistakes, gently correct them.
You can use their native language (language code: ${params.sourceLanguageCode}) for explanations or when they ask questions in that language, but encourage them to converse in English.`;

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    if (params.conversationHistory) {
      for (const msg of params.conversationHistory) {
        messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
      }
    }

    messages.push({ role: 'user', content: params.message });

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://github.com/PDGPuh/lantech-backend',
          'X-Title': 'Lantech Backend',
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL || 'google/gemini-2.5-flash:free',
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouter API error:`, errorText);
        throw new AppError(`AI service error: ${response.statusText}`, 502);
      }

      const data = (await response.json()) as any;
      const reply = data?.choices?.[0]?.message?.content;
      if (!reply) {
        throw new AppError('AI service did not return a valid response choice', 502);
      }

      return reply.trim();
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Error calling OpenRouter tutor:', error);
      throw new AppError(`Failed to communicate with AI Service: ${error.message}`, 502);
    }
  }

  async generateLearningPathSuggestion(params: {
    cefrLevel: CefrLevel;
    sourceLanguageCode: string;
  }): Promise<{ title: string; description: string }> {
    const systemPrompt = `You are a curriculum designer for English learners.
Generate a title and short introductory description for a personalized learning path tailored for CEFR level ${params.cefrLevel}.
Write the title and description in the user's native language (language code: ${params.sourceLanguageCode}).
You must respond with ONLY a raw JSON object matching this format (no other text, no markdown wrappers):
{
  "title": "Title of the learning path in native language",
  "description": "Short description explaining what the path covers, what they will achieve, in native language."
}`;

    const userPrompt = `Generate a personalized learning path description for CEFR level ${params.cefrLevel} in language "${params.sourceLanguageCode}".`;

    const reply = await this.callModel(systemPrompt, userPrompt, true);
    try {
      const cleanJson = this.cleanJsonString(reply);
      const parsed = JSON.parse(cleanJson);
      return {
        title: parsed.title || `${params.cefrLevel} English Path`,
        description: parsed.description || `Learning path for ${params.cefrLevel} level.`,
      };
    } catch (e: any) {
      console.error('Failed to parse learning path JSON:', reply, e);
      return {
        title: `${params.cefrLevel} English Learning Path`,
        description: `Customized course of study for level ${params.cefrLevel} in native language.`,
      };
    }
  }

  async analyzePronunciation(params: {
    targetText: string;
    transcriptText: string;
    sourceLanguageCode: string;
  }): Promise<string | null> {
    const systemPrompt = `You are an expert pronunciation coach.
Compare the "target text" (what the student was supposed to say) with the "transcript text" (what the speech-to-text recognized them actually saying).
Identify any differences, mispronunciations, omitted words, or phonetical errors.
Provide encouraging, clear, and corrective feedback in the user's native language (language code: ${params.sourceLanguageCode}).`;

    const userPrompt = `Target text: "${params.targetText}"
Student actually said: "${params.transcriptText}"

Provide detailed, constructive pronunciation feedback in language code "${params.sourceLanguageCode}".`;

    return this.callModel(systemPrompt, userPrompt, false);
  }
}