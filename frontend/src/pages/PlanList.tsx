import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Empty, Spin, Modal, message } from 'antd';
import {
    EnvironmentOutlined,
    CalendarOutlined,
    DollarOutlined,
    DeleteOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { planApi } from '../api/plan';
import { usePlanStore } from '../store/planStore';
import type { TravelPlan } from '../types';
import dayjs from 'dayjs';
import './PlanList.css';

const PlanList: React.FC = () => {
    const navigate = useNavigate();
    const { plans, setPlans, removePlan } = usePlanStore();
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

    const handleDelete = async (planId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个旅行计划吗？此操作无法撤销。',
            okText: '确认',
            cancelText: '取消',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await planApi.deletePlan(planId);
                    removePlan(planId);
                    message.success('删除成功');
                } catch (error) {
                    console.error('Failed to delete plan:', error);
                }
            },
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="plan-list-container">
            <Card
                title={<h2>我的旅行计划</h2>}
                extra={
                    <Button
                        type="primary"
                        onClick={() => navigate('/create')}
                    >
                        创建新计划
                    </Button>
                }
                className="plan-list-card"
            >
                {plans.length > 0 ? (
                    <List
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 1,
                            md: 2,
                            lg: 2,
                            xl: 3,
                            xxl: 3,
                        }}
                        dataSource={plans}
                        renderItem={(plan: TravelPlan) => (
                            <List.Item>
                                <Card
                                    className="plan-card"
                                    hoverable
                                    actions={[
                                        <Button
                                            type="link"
                                            icon={<EyeOutlined />}
                                            onClick={() => navigate(`/plans/${plan.id}`)}
                                        >
                                            查看
                                        </Button>,
                                        <Button
                                            type="link"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => handleDelete(plan.id, e)}
                                        >
                                            删除
                                        </Button>,
                                    ]}
                                >
                                    <div className="plan-card-header">
                                        <h3 className="plan-card-title">{plan.title}</h3>
                                    </div>
                                    <div className="plan-card-content">
                                        <div className="plan-card-info">
                                            <EnvironmentOutlined className="info-icon" />
                                            <span>{plan.destination}</span>
                                        </div>
                                        <div className="plan-card-info">
                                            <CalendarOutlined className="info-icon" />
                                            <span>
                                                {dayjs(plan.start_date).format('MM/DD')} -{' '}
                                                {dayjs(plan.end_date).format('MM/DD')}
                                            </span>
                                        </div>
                                        {plan.budget && (
                                            <div className="plan-card-info">
                                                <DollarOutlined className="info-icon" />
                                                <span>预算: ¥{plan.budget.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    {plan.preferences && plan.preferences.interests.length > 0 && (
                                        <div className="plan-card-tags">
                                            {plan.preferences.interests.slice(0, 3).map((interest) => (
                                                <Tag key={interest} color="blue">
                                                    {interest}
                                                </Tag>
                                            ))}
                                        </div>
                                    )}
                                </Card>
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

export default PlanList;
