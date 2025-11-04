import { Router } from 'express';
import { planController } from '../controllers/planController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

// 提取旅行需求信息
router.post('/extract', planController.extractTravelInfo.bind(planController));

// 生成旅行计划
router.post('/generate', planController.generatePlan.bind(planController));

// 获取所有计划
router.get('/', planController.getPlans.bind(planController));

// 获取单个计划详情
router.get('/:id', planController.getPlan.bind(planController));

// 删除计划
router.delete('/:id', planController.deletePlan.bind(planController));

export default router;
