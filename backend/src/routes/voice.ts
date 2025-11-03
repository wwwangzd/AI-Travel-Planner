import { Router } from 'express';
import { voiceController } from '../controllers/voiceController';

const router = Router();

router.post('/recognize', voiceController.uploadMiddleware, voiceController.recognize.bind(voiceController));
router.post('/parse-expense', voiceController.parseExpense.bind(voiceController));

export default router;
