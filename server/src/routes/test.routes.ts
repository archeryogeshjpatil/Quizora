import { Router } from 'express';
import * as testController from '../controllers/test.controller';
import { authenticate, authorizeAdmin, authorizeStudent } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Student routes
router.get('/available', authorizeStudent, testController.getAvailableTests);
router.get('/:id/pre-test', authorizeStudent, testController.getPreTestInfo);
router.post('/:id/start', authorizeStudent, testController.startTest);
router.post('/:id/submit', authorizeStudent, testController.submitTest);
router.post('/:id/auto-save', authorizeStudent, testController.autoSaveResponses);
router.get('/:id/review', authorizeStudent, testController.getTestReview);

// Admin routes
router.get('/', authorizeAdmin, testController.getAllTests);
router.post('/question-usage', authorizeAdmin, testController.getQuestionUsage);
router.post('/auto-create', authorizeAdmin, testController.autoCreate);
router.get('/:id', testController.getById);
router.post('/', authorizeAdmin, testController.create);
router.put('/:id', authorizeAdmin, testController.update);
router.delete('/:id', authorizeAdmin, testController.remove);
router.post('/:id/publish-results', authorizeAdmin, testController.publishResults);

export default router;
