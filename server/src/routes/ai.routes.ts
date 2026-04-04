import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate, authorizeStudent } from '../middlewares/auth';

const router = Router();

router.use(authenticate, authorizeStudent);

// AI Assist for answer review
router.post('/ask/claude', aiController.askClaude);
router.post('/ask/chatgpt', aiController.askChatGPT);
router.post('/ask/gemini', aiController.askGemini);
router.post('/ask/grok', aiController.askGrok);

export default router;
