import OpenAI from 'openai';
import { env } from '../../config/env';

class GroqService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!env.GROQ_API_KEY) {
      throw new Error('Groq API key not configured. Add GROQ_API_KEY to your .env file.');
    }
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }
    return this.client;
  }

  async generateQuestions(content: string, params: {
    count: number;
    types: string[];
    difficulty: string;
    language: string;
  }): Promise<string> {
    const client = this.getClient();
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert exam question generator. Generate objective questions in valid JSON format only. Do not include any text outside the JSON array.',
        },
        {
          role: 'user',
          content: `Generate exactly ${params.count} objective questions from the following content.

Requirements:
- Question types allowed: ${params.types.join(', ')}
- Difficulty level: ${params.difficulty}
- Language: ${params.language}
- Output ONLY a JSON array, no other text.
- Each object in the array must have these fields:
  {
    "question": "the question text",
    "type": "MCQ",
    "difficulty": "${params.difficulty}",
    "options": [
      {"label": "A", "text": "option text"},
      {"label": "B", "text": "option text"},
      {"label": "C", "text": "option text"},
      {"label": "D", "text": "option text"}
    ],
    "correctAnswers": ["B"],
    "explanation": "brief explanation"
  }
- For TRUE_FALSE type, only provide two options: A (True) and B (False).
- For MSQ type, correctAnswers can have multiple values like ["A", "C"].
- Use LaTeX format for math formulas where applicable.

Content to generate questions from:
${content.slice(0, 6000)}`,
        },
      ],
      max_tokens: 8192,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '[]';
  }

  async explainAnswer(questionText: string, studentAnswer: string, correctAnswer: string): Promise<string> {
    const client = this.getClient();
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful educational assistant that explains exam answers clearly and concisely.',
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

export const groqService = new GroqService();
