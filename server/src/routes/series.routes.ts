import { Router } from 'express';
import * as seriesController from '../controllers/series.controller';
import { authenticate, authorizeAdmin, authorizeStudent } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Student
router.get('/student', authorizeStudent, seriesController.getStudentSeries);

// Admin + shared
router.get('/', seriesController.getAll);
router.get('/:id', seriesController.getById);
router.get('/:id/leaderboard', seriesController.getLeaderboard);
router.post('/', authorizeAdmin, seriesController.create);
router.put('/:id', authorizeAdmin, seriesController.update);
router.delete('/:id', authorizeAdmin, seriesController.remove);

export default router;
