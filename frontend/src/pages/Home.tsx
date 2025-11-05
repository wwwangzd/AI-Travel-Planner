import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, List, Tag, Empty, Spin } from 'antd';
import {
    PlusOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    DollarOutlined,
    RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { planApi } from '../api/plan';
import { usePlanStore } from '../store/planStore';
import type { TravelPlan } from '../types';
import dayjs from 'dayjs';
import './Home.css';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { plans, setPlans } = usePlanStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await planApi.getPlans();
            if (response.success && response.data) {
                setPlans(response.data.plans);
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const recentPlans = plans.slice(0, 3);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'default',
            ongoing: 'processing',
            completed: 'success',
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            draft: '草稿',
            ongoing: '进行中',
            completed: '已完成',
        };
        return texts[status] || status;
    };

    return (
        <div className="home-container">
            {/* 欢迎横幅 */}
            <div className="welcome-banner">
                <div className="banner-content">
                    <h1 className="banner-title">开启你的智能旅行</h1>
                    <p className="banner-subtitle">
                        使用AI技术，让旅行规划变得简单而有趣
                    </p>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/create')}
                        className="create-btn"
                    >
                        创建新计划
                    </Button>
                </div>
                <div className="banner-illustration">
                    <span className="illustration-icon">🗺️</span>
                </div>
            </div>

            {/* 统计卡片 */}
            <Row gutter={[16, 16]} className="stats-row">
                <Col xs={24} sm={12} md={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="总计划数"
                            value={plans.length}
                            prefix={<EnvironmentOutlined />}
                            valueStyle={{ color: '#667eea' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="进行中"
                            value={plans.filter((p) => p.status === 'ongoing').length}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="已完成"
                            value={plans.filter((p) => p.status === 'completed').length}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="草稿"
                            value={plans.filter((p) => p.status === 'draft').length}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#8c8c8c' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 最近的计划 */}
            <Card
                title="最近的计划"
                extra={
                    <Button type="link" onClick={() => navigate('/plans')}>
                        查看全部 <RightOutlined />
                    </Button>
                }
                className="recent-plans-card"
            >
                {loading ? (
                    <div className="loading-container">
                        <Spin size="large" />
                    </div>
                ) : recentPlans.length > 0 ? (
                    <List
                        dataSource={recentPlans}
                        renderItem={(plan: TravelPlan) => (
                            <List.Item
                                className="plan-item"
                                onClick={() => navigate(`/plans/${plan.id}`)}
                            >
                                <List.Item.Meta
                                    title={
                                        <div className="plan-title">
                                            <span>{plan.title}</span>
                                            <Tag color={getStatusColor(plan.status)}>
                                                {getStatusText(plan.status)}
                                            </Tag>
                                        </div>
                                    }
                                    description={
                                        <div className="plan-description">
                                            <div className="plan-info">
                                                <EnvironmentOutlined /> {plan.destination}
                                            </div>
                                            <div className="plan-info">
                                                <CalendarOutlined />
                                                {dayjs(plan.start_date).format('YYYY-MM-DD')} 至{' '}
                                                {dayjs(plan.end_date).format('YYYY-MM-DD')}
                                            </div>
                                            {plan.budget && (
                                                <div className="plan-info">
                                                    <DollarOutlined /> 预算: ¥{plan.budget}
                                                </div>
                                            )}
                                        </div>
                                    }
                                />
                                <RightOutlined />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty
                        description="还没有创建任何计划"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/create')}
                        >
                            立即创建
                        </Button>
                    </Empty>
                )}
            </Card>

            {/* 功能特性 */}
            <Row gutter={[16, 16]} className="features-row">
                <Col xs={24} md={8}>
                    <Card className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>智能规划</h3>
                        <p>AI自动生成个性化旅行路线，省时省心</p>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="feature-card">
                        <div className="feature-icon">🎤</div>
                        <h3>语音输入</h3>
                        <p>支持语音描述需求，轻松创建旅行计划</p>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="feature-card">
                        <div className="feature-icon">💰</div>
                        <h3>预算管理</h3>
                        <p>实时追踪开销，AI分析消费趋势</p>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Home;
