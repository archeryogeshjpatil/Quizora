import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';

class ClaudeService {
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!env.CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured. Add CLAUDE_API_KEY to your .env file.');
    }
    if (!this.client) {
      this.client = new Anthropic({ apiKey: env.CLAUDE_API_KEY });
    }
    return this.client;
  }

  async explainAnswer(questionText: string, studentAnswer: string, correctAnswer: string): Promise<string> {
    const client = this.getClient();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a helpful educational assistant. A student answered a question incorrectly and needs help understanding the correct answer.

Question: ${questionText}
Student's Answer: ${studentAnswer}
Correct Answer: ${correctAnswer}

Please explain why the correct answer is right, why the student's answer is wrong, and provide a clear explanation to help the student understand the concept.`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    return textBlock ? textBlock.text : 'Unable to generate explanation.';
  }

  async generateQuestions(content: string, params: {
    count: number;
    types: string[];
    difficulty: string;
    language: string;
  }): Promise<string> {
    const client = this.getClient();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Generate ${params.count} objective questions from the following content.

Requirements:
- Question types: ${params.types.join(', ')}
- Difficulty: ${params.difficulty}
- Language: ${params.language}
- For each question, provide: question text, options (A, B, C, D), correct answer(s), and a brief explanation.
- Format the output as a JSON array.
- Support LaTeX for math formulas where applicable.

Content:
${content}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    return textBlock ? textBlock.text : '[]';
  }
}

export const claudeService = new ClaudeService();
