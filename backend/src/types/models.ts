// ============= 用户相关 =============
export interface User {
    id: string;
    email: string;
    password_hash: string;
    username?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

// ============= 旅行需求提取 =============
export interface ExtractedTravelInfo {
    destination: string;           // 目的地
    duration: number;               // 天数
    startDate: string | null;       // 开始日期 (YYYY-MM-DD)
    endDate: string | null;         // 结束日期 (YYYY-MM-DD)
    budget: number;                 // 预算（元）
    travelersCount: number;         // 旅行人数
    preferences: {
        interests: string[];        // 兴趣标签
        specialNeeds: string[];     // 特殊需求（如：带孩子、带老人等）
    };
}

// ============= 旅行计划 =============
export interface TravelPlan {
    id: string;
    user_id: string;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget?: number;
    travelers_count?: number;
    preferences?: {
        interests: string[];
        specialNeeds: string[];
    };
    status: string;
    created_at: string;
    updated_at: string;
}

// ============= 行程详情 =============
export type ItemType = '交通' | '住宿' | '餐饮' | '景点' | '其他';

export interface ItineraryItem {
    id?: string;
    plan_id?: string;
    type: ItemType;
    title: string;
    time?: string;                  // HH:MM 或 HH:MM-HH:MM
    cost: number;
    location?: {
        lat: number;
        lng: number;
    };
    description?: string;
    created_at?: string;
}

export interface DailyItinerary {
    day: number;
    date: string;                   // YYYY-MM-DD
    theme: string;
    items: ItineraryItem[];
}

export interface BudgetBreakdown {
    交通: number;
    住宿: number;
    餐饮: number;
    景点: number;
    其他: number;
}

export interface GeneratedPlan {
    title: string;
    dailyItinerary: DailyItinerary[];
    budgetBreakdown: BudgetBreakdown;
}

// ============= 费用管理 =============
export interface Expense {
    id: string;
    plan_id: string;
    category: ItemType;             // 使用统一的类型标签
    amount: number;
    currency: string;               // 默认 'CNY'
    description: string;
    expense_date: string;           // YYYY-MM-DD
    created_at: string;
}

export interface ExpenseSummary {
    totalExpenses: number;
    budget: number;
    remaining: number;
    percentage: number;             // 已花费百分比
    breakdown: BudgetBreakdown;
}

export interface ExpenseAnalysis {
    budgetStatus: '正常' | '接近超支' | '已超支';
    spendingTrend: string;
    suggestions: string[];
    forecast: {
        estimatedTotal: number;
        riskLevel: '低' | '中' | '高';
    };
    categoryAnalysis: {
        category: string;
        percentage: number;
        status: '合理' | '偏高' | '偏低';
    }[];
}

// ============= 用户偏好 =============
export interface UserPreferences {
    interests: string[];            // 兴趣偏好，如 ["美食", "动漫", "历史文化", "自然风光"]
    specialNeeds: string[];         // 特殊需求，如 ["带孩子", "带老人", "无障碍需求"]
}

export interface UserPreference {
    id: string;
    user_id: string;
    interests: string[];
    special_needs: string[];
    created_at: string;
    updated_at: string;
}

// ============= API 响应 =============
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
