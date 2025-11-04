import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../database/supabase';
import { llmService } from '../services/llmService';
import { AuthRequest } from '../middleware/auth';

const addExpenseSchema = z.object({
    planId: z.string().uuid(),
    category: z.enum(['交通', '住宿', '餐饮', '景点', '其他']),
    amount: z.number().positive(),
    description: z.string(),
    expenseDate: z.string(),
    currency: z.string().default('CNY')
});

const parseVoiceExpenseSchema = z.object({
    text: z.string()
});

export class ExpenseController {
    /**
     * POST /api/expenses - 添加费用记录
     */
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
                    currency
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            res.status(201).json({
                success: true,
                data: expense
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

    /**
     * POST /api/expenses/parse - 解析语音费用记录
     */
    async parseVoiceExpense(req: AuthRequest, res: Response) {
        try {
            const { text } = parseVoiceExpenseSchema.parse(req.body);

            // 使用 LLM 解析语音内容
            const parsed = await llmService.parseExpenseFromVoice(text);

            res.json({
                success: true,
                data: parsed
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
                error: error.message || 'Failed to parse voice expense'
            });
        }
    }

    /**
     * GET /api/expenses/:planId - 获取指定计划的所有费用记录
     */
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

    /**
     * GET /api/expenses/:planId/summary - 获取费用统计汇总
     */
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

            // 按类别分组（使用中文标签）
            const breakdown = {
                '交通': 0,
                '住宿': 0,
                '餐饮': 0,
                '景点': 0,
                '其他': 0
            };

            expenses?.forEach(exp => {
                const category = exp.category as keyof typeof breakdown;
                if (breakdown[category] !== undefined) {
                    breakdown[category] += parseFloat(exp.amount.toString());
                }
            });

            const budget = plan.budget ? parseFloat(plan.budget.toString()) : 0;
            const remaining = budget - totalExpenses;
            const percentage = budget > 0 ? (totalExpenses / budget) * 100 : 0;

            res.json({
                success: true,
                data: {
                    totalExpenses,
                    budget,
                    remaining,
                    percentage,
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

    /**
     * POST /api/expenses/:planId/analyze - AI 费用分析
     */
    async analyzeExpenses(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const { planId } = req.params;

            // 获取计划信息
            const { data: plan } = await supabase
                .from('travel_plans')
                .select('budget, start_date, end_date')
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

            // 计算统计数据
            const totalExpenses = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0) || 0;

            const expensesByCategory = {
                '交通': 0,
                '住宿': 0,
                '餐饮': 0,
                '景点': 0,
                '其他': 0
            };

            expenses?.forEach(exp => {
                const category = exp.category as keyof typeof expensesByCategory;
                if (expensesByCategory[category] !== undefined) {
                    expensesByCategory[category] += parseFloat(exp.amount.toString());
                }
            });

            // 计算剩余天数
            const today = new Date();
            const endDate = new Date(plan.end_date);
            const startDate = new Date(plan.start_date);
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

            // 调用 LLM 进行分析
            const analysis = await llmService.analyzeExpenses({
                budget: plan.budget || 0,
                totalExpenses,
                remainingDays,
                totalDays,
                expensesByCategory
            });

            res.json({
                success: true,
                data: analysis
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to analyze expenses'
            });
        }
    }

    /**
     * DELETE /api/expenses/:id - 删除费用记录
     */
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
