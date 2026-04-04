import { Router } from 'express';
import * as certificateController from '../controllers/certificate.controller';
import { authenticate, authorizeAdmin, authorizeStudent } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Student downloads their certificate
router.get('/my-certificates', authorizeStudent, certificateController.getMyCertificates);
router.get('/download/:id', certificateController.downloadCertificate);

// Admin
router.get('/test/:testId', authorizeAdmin, certificateController.getTestCertificates);
router.post('/generate/:testId', authorizeAdmin, certificateController.generateCertificates);
router.post('/generate-series/:seriesId', authorizeAdmin, certificateController.generateSeriesCertificates);

export default router;
