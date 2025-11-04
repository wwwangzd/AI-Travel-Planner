import { Router } from 'express';
import { voiceController } from '../controllers/voiceController';

const router = Router();

// 语音识别
router.post('/recognize', voiceController.uploadMiddleware, voiceController.recognize.bind(voiceController));

export default router;
