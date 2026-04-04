import api from './api';

interface AskAIData {
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
}

export const aiService = {
  askClaude: (data: AskAIData) => api.post('/ai/ask/claude', data),
  askChatGPT: (data: AskAIData) => api.post('/ai/ask/chatgpt', data),
  askGemini: (data: AskAIData) => api.post('/ai/ask/gemini', data),
  askGrok: (data: AskAIData) => api.post('/ai/ask/grok', data),
};
