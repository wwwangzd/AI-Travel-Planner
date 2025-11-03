import { Router } from 'express';
import { planController } from '../controllers/planController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

router.post('/generate', planController.generatePlan.bind(planController));
router.get('/', planController.getPlans.bind(planController));
router.get('/:id', planController.getPlan.bind(planController));
router.put('/:id', planController.updatePlan.bind(planController));
router.delete('/:id', planController.deletePlan.bind(planController));

export default router;
