import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../database/supabase';
import { AuthRequest } from '../middleware/auth';

const addExpenseSchema = z.object({
    planId: z.string().uuid(),
    category: z.string(),
    amount: z.number().positive(),
    description: z.string().optional(),
    expenseDate: z.string(),
    currency: z.string().default('CNY')
});

export class ExpenseController {
    async addExpense(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const { planId, category, amount, description, expenseDate, currency } =
                addExpenseSchema.parse(req.body);

            // 验证计划所有权
            const { data: plan } = await supabase
                .from('travel_plans')
                .select('id')
                .eq('id', planId)
                .eq('user_id', userId)
                .single();

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    error: 'Plan not found'
                });
            }

            // 添加费用记录
            const { data: expense, error } = await supabase
                .from('expenses')
                .insert({
                    plan_id: planId,
                    category,
                    amount,
                    description,
                    expense_date: expenseDate,
                    currency,
                    created_by: userId
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            res.status(201).json({
                success: true,
                data: { expense }
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors
                });
            }
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to add expense'
            });
        }
    }

    async getExpenses(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const { planId } = req.params;

            // 验证计划所有权
            const { data: plan } = await supabase
                .from('travel_plans')
                .select('id')
                .eq('id', planId)
                .eq('user_id', userId)
                .single();

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    error: 'Plan not found'
                });
            }

            // 获取费用记录
            const { data: expenses, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('plan_id', planId)
                .order('expense_date', { ascending: false });

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                data: { expenses }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get expenses'
            });
        }
    }

    async getExpenseSummary(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const { planId } = req.params;

            // 验证计划所有权并获取预算
            const { data: plan } = await supabase
                .from('travel_plans')
                .select('budget')
                .eq('id', planId)
                .eq('user_id', userId)
                .single();

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    error: 'Plan not found'
                });
            }

            // 获取所有费用
            const { data: expenses, error } = await supabase
                .from('expenses')
                .select('category, amount')
                .eq('plan_id', planId);

            if (error) {
                throw error;
            }

            // 计算总支出
            const totalExpenses = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0) || 0;

            // 按类别分组
            const breakdown: Record<string, number> = {};
            expenses?.forEach(exp => {
                const category = exp.category;
                if (!breakdown[category]) {
                    breakdown[category] = 0;
                }
                breakdown[category] += parseFloat(exp.amount.toString());
            });

            const budget = plan.budget ? parseFloat(plan.budget.toString()) : 0;
            const remaining = budget - totalExpenses;

            res.json({
                success: true,
                data: {
                    totalExpenses,
                    budget,
                    remaining,
                    breakdown
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get expense summary'
            });
        }
    }

    async deleteExpense(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            // 验证费用记录所有权
            const { data: expense } = await supabase
                .from('expenses')
                .select('plan_id')
                .eq('id', id)
                .single();

            if (!expense) {
                return res.status(404).json({
                    success: false,
                    error: 'Expense not found'
                });
            }

            const { data: plan } = await supabase
                .from('travel_plans')
                .select('id')
                .eq('id', expense.plan_id)
                .eq('user_id', userId)
                .single();

            if (!plan) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to delete this expense'
                });
            }

            // 删除费用记录
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                message: 'Expense deleted successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to delete expense'
            });
        }
    }
}

export const expenseController = new ExpenseController();
