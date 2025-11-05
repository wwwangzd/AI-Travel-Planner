import request from '../utils/request';
import type { ApiResponse, User } from '../types';

export interface LoginParams {
    email: string;
    password: string;
}

export interface RegisterParams {
    email: string;
    password: string;
    username?: string;
}

export interface AuthData {
    user: User;
    token: string;
}

export const authApi = {
    // 注册
    register: (data: RegisterParams) =>
        request.post<any, ApiResponse<AuthData>>('/api/auth/register', data),

    // 登录
    login: (data: LoginParams) =>
        request.post<any, ApiResponse<AuthData>>('/api/auth/login', data),

    // 获取当前用户信息
    getProfile: () =>
        request.get<any, ApiResponse<{ user: User }>>('/api/auth/profile'),

    // 登出
    logout: () =>
        request.post<any, ApiResponse>('/api/auth/logout'),
};
