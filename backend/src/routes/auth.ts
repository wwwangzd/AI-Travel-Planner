import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 公开路由
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

// 需要认证的路由
router.get('/profile', authMiddleware, authController.getProfile.bind(authController));

export default router;
