import { Router } from 'express';
import { expenseController } from '../controllers/expenseController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

// 添加费用记录
router.post('/', expenseController.addExpense.bind(expenseController));

// 解析语音费用记录
router.post('/parse', expenseController.parseVoiceExpense.bind(expenseController));

// 获取费用记录
router.get('/:planId', expenseController.getExpenses.bind(expenseController));

// 获取费用统计
router.get('/:planId/summary', expenseController.getExpenseSummary.bind(expenseController));

// AI 费用分析
router.post('/:planId/analyze', expenseController.analyzeExpenses.bind(expenseController));

// 删除费用记录
router.delete('/:id', expenseController.deleteExpense.bind(expenseController));

export default router;
