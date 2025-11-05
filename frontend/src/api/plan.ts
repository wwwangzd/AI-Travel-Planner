import request from '../utils/request';
import type { ApiResponse, ExtractedTravelInfo, GeneratedPlan, TravelPlan, DailyItinerary } from '../types';

export interface ExtractParams {
    userInput: string;
}

export interface GeneratePlanParams {
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    travelersCount: number;
    preferences?: {
        interests: string[];
        specialNeeds: string[];
    };
}

export interface PlanDetailResponse {
    plan: TravelPlan;
    dailyItinerary: DailyItinerary[];
}

export const planApi = {
    // 从自然语言提取旅行需求
    extract: (data: ExtractParams) =>
        request.post<any, ApiResponse<ExtractedTravelInfo>>('/api/plans/extract', data),

    // 生成旅行计划
    generate: (data: GeneratePlanParams) =>
        request.post<any, ApiResponse<GeneratedPlan>>('/api/plans/generate', data),

    // 获取所有旅行计划
    getPlans: () =>
        request.get<any, ApiResponse<{ plans: TravelPlan[] }>>('/api/plans'),

    // 获取指定计划详情
    getPlan: (id: string) =>
        request.get<any, ApiResponse<PlanDetailResponse>>(`/api/plans/${id}`),

    // 删除旅行计划
    deletePlan: (id: string) =>
        request.delete<any, ApiResponse>(`/api/plans/${id}`),
};
