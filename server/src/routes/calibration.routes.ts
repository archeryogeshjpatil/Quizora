import { Router } from 'express';
import * as calibrationController from '../controllers/calibration.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.post('/test/:testId', calibrationController.calibrateTest);
router.post('/apply', calibrationController.applyCalibration);

export default router;
