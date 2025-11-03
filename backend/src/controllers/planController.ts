import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../database/supabase';
import { llmService } from '../services/llmService';
import { AuthRequest } from '../middleware/auth';

const generatePlanSchema = z.object({
    destination: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    budget: z.number().optional(),
    travelersCount: z.number().default(1),
    preferences: z.record(z.any()).optional()
});

const updatePlanSchema = z.object({
    title: z.string().optional(),
    destination: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    budget: z.number().optional(),
    travelersCount: z.number().optional(),
    preferences: z.record(z.any()).optional(),
    status: z.string().optional()
});

export class PlanController {
    async generatePlan(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const params = generatePlanSchema.parse(req.body);

            // 使用 LLM 生成行程计划
            const generatedPlan = await llmService.generateTravelPlan(params);

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
                    preferences: params.preferences || {},
                    status: 'draft'
                })
                .select()
                .single();

            if (planError) {
                throw planError;
            }

            // 保存行程详情
            const itineraryItems = [];
            for (const day of generatedPlan.dailyItinerary) {
                for (let i = 0; i < day.items.length; i++) {
                    const item = day.items[i];
                    itineraryItems.push({
                        plan_id: plan.id,
                        day_number: day.day,
                        item_type: item.type,
                        title: item.title,
                        description: item.description,
                        location: item.location ? {
                            address: item.location,
                            lat: null,
                            lng: null
                        } : null,
                        start_time: item.time || null,
                        estimated_cost: item.estimatedCost || 0,
                        booking_info: { tips: item.tips },
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
                    overview: generatedPlan.overview,
                    itinerary: generatedPlan.dailyItinerary,
                    budgetBreakdown: generatedPlan.budgetBreakdown,
                    tips: generatedPlan.tips
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

            // 组织行程数据
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

    async updatePlan(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const updates = updatePlanSchema.parse(req.body);

            // 验证计划所有权
            const { data: existingPlan } = await supabase
                .from('travel_plans')
                .select('id')
                .eq('id', id)
                .eq('user_id', userId)
                .single();

            if (!existingPlan) {
                return res.status(404).json({
                    success: false,
                    error: 'Plan not found'
                });
            }

            // 更新计划
            const { data: plan, error } = await supabase
                .from('travel_plans')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                data: { plan }
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
                error: error.message || 'Failed to update plan'
            });
        }
    }

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
