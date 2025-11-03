import { Router } from 'express';
import { expenseController } from '../controllers/expenseController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

router.post('/', expenseController.addExpense.bind(expenseController));
router.get('/:planId', expenseController.getExpenses.bind(expenseController));
router.get('/:planId/summary', expenseController.getExpenseSummary.bind(expenseController));
router.delete('/:id', expenseController.deleteExpense.bind(expenseController));

export default router;
