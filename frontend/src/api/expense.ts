import request from '../utils/request';
import type { ApiResponse, Expense, ExpenseSummary, ExpenseAnalysis, ItemType } from '../types';

export interface AddExpenseParams {
    planId: string;
    category: ItemType;
    amount: number;
    description: string;
    expenseDate: string;
    currency?: string;
}

export interface ParseVoiceExpenseParams {
    text: string;
}

export interface ParsedExpense {
    category: ItemType;
    amount: number;
    description: string;
}

export const expenseApi = {
    // 添加费用记录
    addExpense: (data: AddExpenseParams) =>
        request.post<any, ApiResponse<Expense>>('/api/expenses', data),

    // 解析语音费用记录
    parseVoiceExpense: (data: ParseVoiceExpenseParams) =>
        request.post<any, ApiResponse<ParsedExpense>>('/api/expenses/parse', data),

    // 获取指定计划的所有费用记录
    getExpenses: (planId: string) =>
        request.get<any, ApiResponse<{ expenses: Expense[] }>>(`/api/expenses/${planId}`),

    // 获取费用统计汇总
    getExpenseSummary: (planId: string) =>
        request.get<any, ApiResponse<ExpenseSummary>>(`/api/expenses/${planId}/summary`),

    // AI 费用分析
    analyzeExpenses: (planId: string) =>
        request.post<any, ApiResponse<ExpenseAnalysis>>(`/api/expenses/${planId}/analyze`, {}),

    // 删除费用记录
    deleteExpense: (id: string) =>
        request.delete<any, ApiResponse>(`/api/expenses/${id}`),
};
