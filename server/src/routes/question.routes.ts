import { Router } from 'express';
import * as questionController from '../controllers/question.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { uploadDocument, uploadImage } from '../middlewares/upload';

const router = Router();

// Public route — no auth needed
router.get('/bulk-import/template', questionController.downloadTemplate);

// All other routes require admin auth
router.use(authenticate, authorizeAdmin);

// CRUD
router.get('/', questionController.getAll);
router.get('/:id', questionController.getById);
router.get('/:id/versions', questionController.getVersionHistory);
router.post('/:id/restore/:versionId', questionController.restoreVersion);
router.post('/', questionController.create);
router.put('/:id', questionController.update);
router.delete('/:id', questionController.remove);

// Bulk import
router.post('/bulk-import', uploadDocument.single('file'), questionController.bulkImport);

// AI generation
router.post('/ai-generate', uploadDocument.single('file'), questionController.aiGenerate);
router.post('/ai-generate-from-text', questionController.aiGenerateFromText);

// Batch save AI-generated questions to question bank
router.post('/batch-save', questionController.batchSave);

// Image upload for question content
router.post('/upload-image', uploadImage.single('image'), questionController.uploadQuestionImage);

export default router;
