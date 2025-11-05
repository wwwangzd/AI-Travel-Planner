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

    return (
        <div className="home-container">
            {/* 欢迎横幅 */}
            <div className="welcome-banner">
                <div className="banner-content">
                    <h1 className="banner-title">开启你的智能旅行</h1>
                    <p className="banner-subtitle">
                        使用 AI 技术，让旅行规划变得简单而有趣
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

            {/* 功能特性 */}
            <Row gutter={[16, 16]} className="features-row">
                <Col xs={24} md={8}>
                    <Card className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>智能规划</h3>
                        <p>自动生成个性化旅行路线，省时省心</p>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="feature-card">
                        <div className="feature-icon">💰</div>
                        <h3>预算管理</h3>
                        <p>实时追踪开销，智能分析消费趋势</p>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>偏好学习</h3>
                        <p>记录旅行偏好，提供精准推荐</p>
                    </Card>
                </Col>
            </Row>

            {/* 统计卡片 */}
            <Row gutter={[16, 16]} className="stats-row">
                <Col xs={24} sm={8}>
                    <Card className="stat-card">
                        <Statistic
                            title="总计划数"
                            value={plans.length}
                            prefix={<EnvironmentOutlined />}
                            valueStyle={{ color: '#667eea' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="stat-card">
                        <Statistic
                            title="旅行天数"
                            value={plans.reduce((sum, p) => {
                                const start = dayjs(p.start_date);
                                const end = dayjs(p.end_date);
                                return sum + end.diff(start, 'day') + 1;
                            }, 0)}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                            suffix="天"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="stat-card">
                        <Statistic
                            title="总预算"
                            value={plans.reduce((sum, p) => sum + (p.budget || 0), 0)}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                            prefix="¥"
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
                                    title={<div className="plan-title">{plan.title}</div>}
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
        </div>
    );
};

export default Home;
