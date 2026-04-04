import { Router } from 'express';
import * as proctoringController from '../controllers/proctoring.controller';
import { authenticate, authorizeAdmin, authorizeStudent } from '../middlewares/auth';
import { uploadImage } from '../middlewares/upload';

const router = Router();

router.use(authenticate);

// Student uploads snapshot during test
router.post('/snapshot', authorizeStudent, uploadImage.single('snapshot'), proctoringController.uploadSnapshot);

// Admin views proctoring data
router.get('/test/:testId/student/:studentId', authorizeAdmin, proctoringController.getSnapshots);
router.get('/test/:testId/flags', authorizeAdmin, proctoringController.getFlags);

export default router;
