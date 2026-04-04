import { Router } from 'express';
import * as resultController from '../controllers/result.controller';
import { authenticate, authorizeAdmin, authorizeStudent } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Student
router.get('/my-results', authorizeStudent, resultController.getMyResults);
router.get('/my-results/:attemptId', authorizeStudent, resultController.getResultDetail);

// Admin
router.get('/test/:testId', authorizeAdmin, resultController.getTestResults);
router.get('/export/:testId/pdf', authorizeAdmin, resultController.exportPdf);
router.get('/export/:testId/excel', authorizeAdmin, resultController.exportExcel);
router.post('/dispatch', authorizeAdmin, resultController.dispatchResults);
router.post('/schedule-dispatch', authorizeAdmin, resultController.scheduleDispatch);
router.get('/scheduled', authorizeAdmin, resultController.getScheduledDispatches);
router.delete('/scheduled/:id', authorizeAdmin, resultController.cancelScheduledDispatch);

export default router;
