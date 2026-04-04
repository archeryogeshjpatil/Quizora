import { Router } from 'express';
import * as subjectController from '../controllers/subject.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Public (authenticated)
router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);

// Admin only
router.post('/', authorizeAdmin, subjectController.create);
router.put('/:id', authorizeAdmin, subjectController.update);
router.delete('/:id', authorizeAdmin, subjectController.remove);

export default router;
