import OpenAI from 'openai';
import { env } from '../../config/env';

class GrokService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      // Grok uses OpenAI-compatible API via xAI
      this.client = new OpenAI({
        apiKey: env.GROK_API_KEY,
        baseURL: 'https://api.x.ai/v1',
      });
    }
    return this.client;
  }

  async explainAnswer(questionText: string, studentAnswer: string, correctAnswer: string): Promise<string> {
    const client = this.getClient();
    const response = await client.chat.completions.create({
      model: 'grok-3',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful educational assistant that explains exam answers clearly.',
        },
        {
          role: 'user',
          content: `Question: ${questionText}\nStudent's Answer: ${studentAnswer}\nCorrect Answer: ${correctAnswer}\n\nPlease explain why the correct answer is right and help the student understand the concept.`,
        },
      ],
      max_tokens: 1024,
    });

    return response.choices[0]?.message?.content || 'Unable to generate explanation.';
  }
}

export const grokService = new GrokService();
