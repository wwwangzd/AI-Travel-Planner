import { Request, Response } from 'express';
import multer from 'multer';
import { xfVoiceService } from '../services/voiceService';

// 配置 multer 用于处理文件上传
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

export class VoiceController {
    uploadMiddleware = upload.single('audio');

    async recognize(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No audio file provided'
                });
            }

            // 将音频文件转换为 base64
            const audioBase64 = req.file.buffer.toString('base64');

            // 调用科大讯飞语音识别
            const text = await xfVoiceService.recognize(audioBase64);

            res.json({
                success: true,
                data: {
                    text,
                    confidence: 0.95 // 科大讯飞不返回置信度，这里给一个固定值
                }
            });
        } catch (error: any) {
            console.error('Voice recognition error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to recognize voice'
            });
        }
    }
}

export const voiceController = new VoiceController();
