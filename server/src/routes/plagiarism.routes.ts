import { Router } from 'express';
import * as plagiarismController from '../controllers/plagiarism.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.post('/analyze/:testId', plagiarismController.analyzeTest);
router.get('/flags/:testId', plagiarismController.getFlags);
router.patch('/flags/:id/review', plagiarismController.reviewFlag);

export default router;
