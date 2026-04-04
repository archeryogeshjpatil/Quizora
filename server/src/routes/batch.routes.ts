import { Router } from 'express';
import * as batchController from '../controllers/batch.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/', batchController.getAll);
router.get('/:id', batchController.getById);
router.post('/', batchController.create);
router.put('/:id', batchController.update);
router.delete('/:id', batchController.remove);

// Student assignment
router.post('/:id/students', batchController.addStudents);
router.delete('/:id/students/:studentId', batchController.removeStudent);

// Test assignment
router.post('/:id/tests', batchController.assignTests);
router.delete('/:id/tests/:testId', batchController.removeTest);

export default router;
