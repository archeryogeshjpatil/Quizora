import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.patch('/:id/status', userController.toggleStatus);
router.get('/:id/attempts', userController.getUserAttempts);

export default router;
