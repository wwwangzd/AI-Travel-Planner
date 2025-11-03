export interface User {
    id: string;
    email: string;
    password_hash: string;
    username?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface TravelPlan {
    id: string;
    user_id: string;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget?: number;
    travelers_count?: number;
    preferences?: Record<string, any>;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ItineraryItem {
    id: string;
    plan_id: string;
    day_number: number;
    item_type: string;
    title: string;
    description?: string;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
    start_time?: string;
    end_time?: string;
    estimated_cost?: number;
    booking_info?: Record<string, any>;
    sort_order?: number;
    created_at: string;
}

export interface Expense {
    id: string;
    plan_id: string;
    category: string;
    amount: number;
    currency: string;
    description?: string;
    expense_date: string;
    created_by?: string;
    created_at: string;
}

export interface UserPreference {
    id: string;
    user_id: string;
    preference_key: string;
    preference_value: Record<string, any>;
    updated_at: string;
}
