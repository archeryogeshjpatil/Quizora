import { Router } from 'express';
import authRoutes from './auth.routes';
import subjectRoutes from './subject.routes';
import topicRoutes from './topic.routes';
import batchRoutes from './batch.routes';
import questionRoutes from './question.routes';
import testRoutes from './test.routes';
import seriesRoutes from './series.routes';
import resultRoutes from './result.routes';
import analyticsRoutes from './analytics.routes';
import userRoutes from './user.routes';
import proctoringRoutes from './proctoring.routes';
import plagiarismRoutes from './plagiarism.routes';
import calibrationRoutes from './calibration.routes';
import certificateRoutes from './certificate.routes';
import notificationRoutes from './notification.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/subjects', subjectRoutes);
router.use('/topics', topicRoutes);
router.use('/batches', batchRoutes);
router.use('/questions', questionRoutes);
router.use('/tests', testRoutes);
router.use('/series', seriesRoutes);
router.use('/results', resultRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/proctoring', proctoringRoutes);
router.use('/plagiarism', plagiarismRoutes);
router.use('/calibration', calibrationRoutes);
router.use('/certificates', certificateRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);

export default router;
