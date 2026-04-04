import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';

class GeminiService {
  private client: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    if (!this.client) {
      this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    return this.client;
  }

  async explainAnswer(questionText: string, studentAnswer: string, correctAnswer: string): Promise<string> {
    const client = this.getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a helpful educational assistant. A student answered a question incorrectly.

Question: ${questionText}
Student's Answer: ${studentAnswer}
Correct Answer: ${correctAnswer}

Please explain why the correct answer is right, why the student's answer is wrong, and help the student understand the concept.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text() || 'Unable to generate explanation.';
  }
}

export const geminiService = new GeminiService();
