import request from '../utils/request';
import type { ApiResponse, UserPreferences } from '../types';

export const preferenceApi = {
    // 获取用户偏好
    getPreferences: () =>
        request.get<any, ApiResponse<UserPreferences>>('/api/preferences'),

    // 更新用户偏好
    updatePreferences: (data: UserPreferences) =>
        request.put<any, ApiResponse<UserPreferences>>('/api/preferences', data),

    // 从历史计划学习偏好
    learnPreferences: () =>
        request.post<any, ApiResponse<UserPreferences>>('/api/preferences/learn', {}),
};
