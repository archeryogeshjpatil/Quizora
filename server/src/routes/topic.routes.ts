import { Router } from 'express';
import * as topicController from '../controllers/topic.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/subject/:subjectId', topicController.getBySubject);
router.post('/', authorizeAdmin, topicController.create);
router.put('/:id', authorizeAdmin, topicController.update);
router.delete('/:id', authorizeAdmin, topicController.remove);

export default router;
