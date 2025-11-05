import React, { useState } from 'react';
import { Form, Input, Button, Card, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import './Auth.css';

const { TabPane } = Tabs;

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleLogin = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const response = await authApi.login(values);
            if (response.success && response.data) {
                setAuth(response.data.user, response.data.token);
                message.success('登录成功！');
                navigate('/');
            }
        } catch (error: any) {
            console.error('Login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (values: { email: string; password: string; username?: string }) => {
        setLoading(true);
        try {
            const response = await authApi.register(values);
            if (response.success && response.data) {
                setAuth(response.data.user, response.data.token);
                message.success('注册成功！');
                navigate('/');
            }
        } catch (error: any) {
            console.error('Register failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="auth-overlay" />
            </div>
            <Card className="auth-card" bordered={false}>
                <div className="auth-header">
                    <h1 className="auth-title">AI 旅行规划师</h1>
                    <p className="auth-subtitle">智能规划您的完美旅程</p>
                </div>
                <Tabs defaultActiveKey="login" centered>
                    <TabPane tab="登录" key="login">
                        <Form
                            name="login"
                            onFinish={handleLogin}
                            autoComplete="off"
                            size="large"
                        >
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: '请输入邮箱' },
                                    { type: 'email', message: '请输入有效的邮箱地址' },
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="邮箱"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: '请输入密码' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="密码"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    size="large"
                                >
                                    登录
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    <TabPane tab="注册" key="register">
                        <Form
                            name="register"
                            onFinish={handleRegister}
                            autoComplete="off"
                            size="large"
                        >
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: '请输入邮箱' },
                                    { type: 'email', message: '请输入有效的邮箱地址' },
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="邮箱"
                                />
                            </Form.Item>

                            <Form.Item
                                name="username"
                                rules={[{ required: false }]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="用户名（可选）"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[
                                    { required: true, message: '请输入密码' },
                                    { min: 6, message: '密码至少6个字符' },
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="密码（至少6个字符）"
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: '请确认密码' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('两次输入的密码不一致'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="确认密码"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    size="large"
                                >
                                    注册
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default Auth;
