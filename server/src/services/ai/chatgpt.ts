import OpenAI from 'openai';
import { env } from '../../config/env';

class ChatGPTService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
    return this.client;
  }

  async explainAnswer(questionText: string, studentAnswer: string, correctAnswer: string): Promise<string> {
    const client = this.getClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
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

export const chatgptService = new ChatGPTService();
