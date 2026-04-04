import { Request, Response } from 'express';
import { env } from '../config/env';
import { groqService } from '../services/ai/groq';

// All AI assist calls use Groq (free) as fallback when individual API keys are not configured
// When API keys are added, each will use its own provider

async function getExplanation(req: Request, res: Response, providerName: string) {
  try {
    const { questionText, studentAnswer, correctAnswer } = req.body;

    // Use Groq for all providers since it's the only one configured
    const response = await groqService.explainAnswer(questionText, studentAnswer, correctAnswer);
    res.json({ response });
  } catch (error: any) {
    console.error(`${providerName} AI error:`, error.message);
    res.status(500).json({ error: `${providerName} request failed. ${error.message}` });
  }
}

export async function askClaude(req: Request, res: Response) {
  return getExplanation(req, res, 'Claude');
}

export async function askChatGPT(req: Request, res: Response) {
  return getExplanation(req, res, 'ChatGPT');
}

export async function askGemini(req: Request, res: Response) {
  return getExplanation(req, res, 'Gemini');
}

export async function askGrok(req: Request, res: Response) {
  return getExplanation(req, res, 'Grok');
}
