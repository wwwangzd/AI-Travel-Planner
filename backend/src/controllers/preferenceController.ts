import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../database/supabase';
import { AuthRequest } from '../middleware/auth';

const updatePreferencesSchema = z.object({
    interests: z.array(z.string()).optional(),
    specialNeeds: z.array(z.string()).optional()
});

export class PreferenceController {
    /**
     * GET /api/preferences - 获取用户偏好设置
     */
    async getPreferences(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;

            // 查询用户偏好
            const { data: preferences, error } = await supabase
                .from('user_preferences')
                .select('interests, special_needs')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 表示没有找到记录
                throw error;
            }

            // 如果没有偏好记录，返回默认空数组
            if (!preferences) {
                return res.json({
                    success: true,
                    data: {
                        interests: [],
                        specialNeeds: []
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    interests: preferences.interests || [],
                    specialNeeds: preferences.special_needs || []
                }
            });
        } catch (error: any) {
            console.error('Get preferences error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get preferences'
            });
        }
    }

    /**
     * PUT /api/preferences - 更新用户偏好
     */
    async updatePreferences(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const { interests, specialNeeds } = updatePreferencesSchema.parse(req.body);

            // 检查是否已有偏好记录
            const { data: existing } = await supabase
                .from('user_preferences')
                .select('id')
                .eq('user_id', userId)
                .single();

            let result;

            if (existing) {
                // 更新现有记录
                const updateData: any = {};
                if (interests !== undefined) updateData.interests = interests;
                if (specialNeeds !== undefined) updateData.special_needs = specialNeeds;

                const { data, error } = await supabase
                    .from('user_preferences')
                    .update(updateData)
                    .eq('user_id', userId)
                    .select('interests, special_needs')
                    .single();

                if (error) throw error;
                result = data;
            } else {
                // 创建新记录
                const { data, error } = await supabase
                    .from('user_preferences')
                    .insert({
                        user_id: userId,
                        interests: interests || [],
                        special_needs: specialNeeds || []
                    })
                    .select('interests, special_needs')
                    .single();

                if (error) throw error;
                result = data;
            }

            res.json({
                success: true,
                message: '偏好已更新',
                data: {
                    interests: result.interests || [],
                    specialNeeds: result.special_needs || []
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
            console.error('Update preferences error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update preferences'
            });
        }
    }

    /**
     * POST /api/preferences/learn - 从历史计划中学习用户偏好
     */
    async learnFromHistory(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;

            // 获取用户所有计划的偏好数据
            const { data: plans, error } = await supabase
                .from('travel_plans')
                .select('preferences')
                .eq('user_id', userId);

            if (error) throw error;

            if (!plans || plans.length === 0) {
                return res.json({
                    success: true,
                    message: '没有足够的历史数据进行学习',
                    data: {
                        interests: [],
                        specialNeeds: []
                    }
                });
            }

            // 统计各个偏好的出现频率
            const interestsCount: Record<string, number> = {};
            const specialNeedsCount: Record<string, number> = {};

            plans.forEach(plan => {
                if (plan.preferences) {
                    const prefs = plan.preferences as { interests?: string[], specialNeeds?: string[] };

                    // 统计兴趣
                    if (prefs.interests) {
                        prefs.interests.forEach(interest => {
                            interestsCount[interest] = (interestsCount[interest] || 0) + 1;
                        });
                    }

                    // 统计特殊需求
                    if (prefs.specialNeeds) {
                        prefs.specialNeeds.forEach(need => {
                            specialNeedsCount[need] = (specialNeedsCount[need] || 0) + 1;
                        });
                    }
                }
            });

            // 提取出现频率 >= 30% 的偏好
            const threshold = plans.length * 0.3;
            const learnedInterests = Object.entries(interestsCount)
                .filter(([_, count]) => count >= threshold)
                .map(([interest, _]) => interest);

            const learnedSpecialNeeds = Object.entries(specialNeedsCount)
                .filter(([_, count]) => count >= threshold)
                .map(([need, _]) => need);

            // 更新用户偏好
            const { data: existing } = await supabase
                .from('user_preferences')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (existing) {
                await supabase
                    .from('user_preferences')
                    .update({
                        interests: learnedInterests,
                        special_needs: learnedSpecialNeeds
                    })
                    .eq('user_id', userId);
            } else {
                await supabase
                    .from('user_preferences')
                    .insert({
                        user_id: userId,
                        interests: learnedInterests,
                        special_needs: learnedSpecialNeeds
                    });
            }

            res.json({
                success: true,
                message: '已从历史计划中学习并更新偏好',
                data: {
                    interests: learnedInterests,
                    specialNeeds: learnedSpecialNeeds
                }
            });
        } catch (error: any) {
            console.error('Learn from history error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to learn from history'
            });
        }
    }
}

export const preferenceController = new PreferenceController();
