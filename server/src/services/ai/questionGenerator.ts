import { env } from '../../config/env';
import { claudeService } from './claude';
import { groqService } from './groq';
import { parseDocument } from '../parsers';
import { ocrService } from '../ocr/tesseract';

interface GenerateParams {
  filePath: string;
  mimeType: string;
  subjectId: string;
  count: number;
  types: string[];
  difficulty: string;
  difficultyDistribution?: Record<string, number>;
  focusArea?: string;
  language: string;
}

interface TextGenerateParams {
  text: string;
  subjectId: string;
  count: number;
  types: string[];
  difficulty: string;
  language: string;
}

interface AIParams {
  count: number;
  types: string[];
  difficulty: string;
  language: string;
}

class AIQuestionGenerator {
  async generateFromText(params: TextGenerateParams): Promise<any[]> {
    const content = params.text;
    if (!content || content.trim().length < 10) {
      throw new Error('Please provide more content to generate questions from.');
    }
    return this.callAI(content, {
      count: params.count,
      types: params.types,
      difficulty: params.difficulty,
      language: params.language,
    });
  }

  async generate(params: GenerateParams): Promise<any[]> {
    let content: string;

    if (params.mimeType.startsWith('image/')) {
      content = await ocrService.extractText(params.filePath);
    } else {
      content = await parseDocument(params.filePath, params.mimeType);
    }

    if (!content || content.trim().length < 50) {
      throw new Error('Insufficient content extracted from the document. Please upload a document with more text.');
    }

    if (params.focusArea) {
      content = `Focus specifically on: ${params.focusArea}\n\n${content}`;
    }

    return this.callAI(content, {
      count: params.count,
      types: params.types,
      difficulty: params.difficulty,
      language: params.language,
    });
  }

  private async callAI(content: string, params: AIParams): Promise<any[]> {
    let rawResponse: string;

    if (env.GROQ_API_KEY) {
      console.log('Using Groq for question generation');
      rawResponse = await groqService.generateQuestions(content, params);
    } else if (env.CLAUDE_API_KEY) {
      console.log('Using Claude for question generation');
      rawResponse = await claudeService.generateQuestions(content, params);
    } else {
      throw new Error('No AI provider configured. Add GROQ_API_KEY or CLAUDE_API_KEY to your .env file.');
    }

    // Parse AI response — handle truncated responses
    try {
      const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      const arrayStart = rawResponse.indexOf('[');
      if (arrayStart !== -1) {
        let truncated = rawResponse.slice(arrayStart);
        const lastCompleteObj = truncated.lastIndexOf('}');
        if (lastCompleteObj !== -1) {
          truncated = truncated.slice(0, lastCompleteObj + 1) + ']';
          const parsed = JSON.parse(truncated);
          console.log(`Salvaged ${parsed.length} questions from truncated response`);
          return parsed;
        }
      }

      return JSON.parse(rawResponse);
    } catch {
      console.error('Failed to parse AI response:', rawResponse.slice(0, 500));
      throw new Error('Failed to parse AI-generated questions. Please try again with fewer questions.');
    }
  }
}

export const aiQuestionGenerator = new AIQuestionGenerator();
