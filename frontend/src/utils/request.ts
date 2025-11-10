import axios, { AxiosError } from 'axios';
import { message } from 'antd';

// 创建 axios 实例
const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 120000, // 改为 120 秒，适应生成计划的长时间请求
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error: AxiosError<any>) => {
        // 处理错误响应
        if (error.response) {
            const { status, data } = error.response;
            const isLoginRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');

            // 错误信息映射（英文转中文）
            const errorMessages: Record<string, string> = {
                'Invalid email or password': '邮箱或密码错误',
                'Email already registered': '该邮箱已被注册',
                'Validation error': '输入格式错误',
                'User not found': '用户不存在',
            };

            switch (status) {
                case 400:
                    // 验证错误
                    const validationMsg = errorMessages[data?.error] || data?.error || '请求参数错误';
                    message.error(validationMsg);
                    break;
                case 401:
                    // 如果是登录或注册请求失败，只显示错误信息，不跳转
                    if (isLoginRequest) {
                        const loginMsg = errorMessages[data?.error] || data?.error || '邮箱或密码错误';
                        message.error(loginMsg);
                    } else {
                        // 其他 401 错误（如 token 过期），清除 token 并跳转到登录页
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        message.error('登录已过期，请重新登录');
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    message.error('没有权限访问');
                    break;
                case 404:
                    message.error(errorMessages[data?.error] || '请求的资源不存在');
                    break;
                case 500:
                    message.error('服务器错误，请稍后重试');
                    break;
                default:
                    const defaultMsg = errorMessages[data?.error] || data?.error || data?.message || '请求失败';
                    message.error(defaultMsg);
            }
        } else if (error.request) {
            message.error('网络错误，请检查网络连接');
        } else {
            message.error('请求配置错误');
        }

        return Promise.reject(error);
    }
);

export default request;
