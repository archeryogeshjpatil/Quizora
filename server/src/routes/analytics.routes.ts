import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate, authorizeAdmin, authorizeStudent } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Student analytics
router.get('/student/dashboard', authorizeStudent, analyticsController.getStudentDashboard);
router.get('/student/performance', authorizeStudent, analyticsController.getStudentPerformance);

// Admin analytics
router.get('/admin/dashboard', authorizeAdmin, analyticsController.getAdminDashboard);
router.get('/admin/test/:testId', authorizeAdmin, analyticsController.getTestAnalytics);

// Leaderboard
router.get('/leaderboard/test/:testId', analyticsController.getTestLeaderboard);

export default router;
