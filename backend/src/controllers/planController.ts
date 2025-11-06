import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../database/supabase';
import { llmService } from '../services/llmService';
import { AuthRequest } from '../middleware/auth';

// 提取旅行需求
const extractSchema = z.object({
    userInput: z.string()
});

// 生成旅行计划
const generatePlanSchema = z.object({
    destination: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    budget: z.number(),
    travelersCount: z.number(),
    preferences: z.object({
        interests: z.array(z.string()),
        specialNeeds: z.array(z.string())
    }).optional() // 允许不传，会自动从用户偏好加载
});

export class PlanController {
    /**
     * POST /api/plans/extract - 从自然语言提取旅行需求
     */
    async extractTravelInfo(req: AuthRequest, res: Response) {
        try {
            const { userInput } = extractSchema.parse(req.body);

            // 使用 LLM 提取结构化信息
            const extractedInfo = await llmService.extractTravelInfo(userInput);

            res.json({
                success: true,
                data: extractedInfo
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors
                });
            }
            console.error('Extract travel info error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to extract travel information'
            });
        }
    }

    /**
     * POST /api/plans/generate - 生成旅行计划
     */
    async generatePlan(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const params = generatePlanSchema.parse(req.body);

            // 如果没有传入偏好，则从用户默认偏好加载
            let preferences = params.preferences;
            if (!preferences) {
                const { data: userPrefs } = await supabase
                    .from('user_preferences')
                    .select('interests, special_needs')
                    .eq('user_id', userId)
                    .single();

                if (userPrefs) {
                    preferences = {
                        interests: userPrefs.interests || [],
                        specialNeeds: userPrefs.special_needs || []
                    };
                } else {
                    // 如果没有设置偏好，使用空数组
                    preferences = {
                        interests: [],
                        specialNeeds: []
                    };
                }
            }

            // 计算天数
            const start = new Date(params.startDate);
            const end = new Date(params.endDate);
            const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            // 构造完整的旅行信息
            const travelInfo = {
                destination: params.destination,
                startDate: params.startDate,
                endDate: params.endDate,
                budget: params.budget,
                travelersCount: params.travelersCount,
                preferences,
                duration
            };

            // 使用 LLM 生成行程计划
            const generatedPlan = await llmService.generateTravelPlan(travelInfo);

            // 保存旅行计划
            const { data: plan, error: planError } = await supabase
                .from('travel_plans')
                .insert({
                    user_id: userId,
                    title: generatedPlan.title,
                    destination: params.destination,
                    start_date: params.startDate,
                    end_date: params.endDate,
                    budget: params.budget,
                    travelers_count: params.travelersCount,
                    preferences: preferences,
                    status: 'draft'
                })
                .select()
                .single();

            if (planError) {
                throw planError;
            }

            // 保存每日行程详情
            const itineraryItems = [];
            for (const dailyPlan of generatedPlan.dailyItinerary) {
                for (let i = 0; i < dailyPlan.items.length; i++) {
                    const item = dailyPlan.items[i];
                    itineraryItems.push({
                        plan_id: plan.id,
                        day_number: dailyPlan.day,
                        day_theme: dailyPlan.theme || null,
                        item_type: item.type,
                        title: item.title,
                        description: item.description || null,
                        location: item.location || null,
                        start_time: item.time || null,
                        estimated_cost: item.cost || 0,
                        sort_order: i
                    });
                }
            }

            if (itineraryItems.length > 0) {
                const { error: itemsError } = await supabase
                    .from('itinerary_items')
                    .insert(itineraryItems);

                if (itemsError) {
                    console.error('Failed to save itinerary items:', itemsError);
                }
            }

            // 返回完整计划
            res.status(201).json({
                success: true,
                data: {
                    planId: plan.id,
                    title: generatedPlan.title,
                    itinerary: generatedPlan.dailyItinerary
                }
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors
                });
            }
            console.error('Generate plan error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to generate plan'
            });
        }
    }

    /**
     * GET /api/plans - 获取用户所有旅行计划
     */
    async getPlans(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;

            const { data: plans, error } = await supabase
                .from('travel_plans')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                data: { plans }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get plans'
            });
        }
    }

    /**
     * GET /api/plans/:id - 获取指定旅行计划详情
     */
    async getPlan(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            // 获取计划基本信息
            const { data: plan, error: planError } = await supabase
                .from('travel_plans')
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .single();

            if (planError || !plan) {
                return res.status(404).json({
                    success: false,
                    error: 'Plan not found'
                });
            }

            // 获取行程详情
            const { data: items, error: itemsError } = await supabase
                .from('itinerary_items')
                .select('*')
                .eq('plan_id', id)
                .order('day_number', { ascending: true })
                .order('sort_order', { ascending: true });

            if (itemsError) {
                throw itemsError;
            }

            // 按天组织行程数据
            const dailyItinerary: any = {};
            items?.forEach(item => {
                if (!dailyItinerary[item.day_number]) {
                    dailyItinerary[item.day_number] = [];
                }
                dailyItinerary[item.day_number].push(item);
            });

            res.json({
                success: true,
                data: {
                    plan,
                    dailyItinerary: Object.keys(dailyItinerary).map(day => ({
                        day: parseInt(day),
                        items: dailyItinerary[day]
                    }))
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get plan'
            });
        }
    }

    /**
     * DELETE /api/plans/:id - 删除旅行计划
     */
    async deletePlan(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            // 验证计划所有权并删除
            const { error } = await supabase
                .from('travel_plans')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                message: 'Plan deleted successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to delete plan'
            });
        }
    }
}

export const planController = new PlanController();
