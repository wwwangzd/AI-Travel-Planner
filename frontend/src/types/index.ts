// ============= 用户相关 =============
export interface User {
    id: string;
    email: string;
    username?: string;
    avatar_url?: string;
    created_at: string;
}

// ============= 旅行需求提取 =============
export interface ExtractedTravelInfo {
    destination: string;
    duration: number;
    startDate: string | null;
    endDate: string | null;
    budget: number;
    travelersCount: number;
    preferences: {
        interests: string[];
        specialNeeds: string[];
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
    budget_breakdown?: BudgetBreakdown;
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
    day_number?: number;
    day_theme?: string;
    item_type?: ItemType;
    type?: ItemType;
    title: string;
    time?: string;
    start_time?: string;
    cost?: number;
    estimated_cost?: number;
    location?: {
        lat: number;
        lng: number;
    };
    description?: string;
    sort_order?: number;
    created_at?: string;
}

export interface DailyItinerary {
    day: number;
    date?: string;
    theme?: string;
    items: ItineraryItem[];
}

export interface GeneratedPlan {
    planId: string;
    title: string;
    itinerary: DailyItinerary[];
}

// ============= 费用管理 =============
export interface BudgetBreakdown {
    交通: number;
    住宿: number;
    餐饮: number;
    景点: number;
    其他: number;
}

export interface Expense {
    id: string;
    plan_id: string;
    category: ItemType;
    amount: number;
    currency: string;
    description: string;
    expense_date: string;
    created_at: string;
}

export interface ExpenseSummary {
    totalExpenses: number;
    budget: number;
    remaining: number;
    percentage: number;
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
    interests: string[];
    specialNeeds: string[];
}

// ============= API 响应 =============
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    details?: any;
}

// ============= 地图相关 =============
export interface MapLocation {
    lat: number;
    lng: number;
}

export interface POI {
    name: string;
    address: string;
    location: MapLocation;
    type: string;
}
