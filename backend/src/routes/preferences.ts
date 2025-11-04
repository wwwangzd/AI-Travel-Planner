import { Router } from 'express';
import { preferenceController } from '../controllers/preferenceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

// 获取用户偏好
router.get('/', preferenceController.getPreferences.bind(preferenceController));

// 更新用户偏好
router.put('/', preferenceController.updatePreferences.bind(preferenceController));

// 从历史计划学习偏好
router.post('/learn', preferenceController.learnFromHistory.bind(preferenceController));

export default router;
