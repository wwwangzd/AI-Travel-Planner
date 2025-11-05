import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Tabs,
    Timeline,
    Tag,
    Button,
    Row,
    Col,
    Statistic,
    Spin,
    Empty,
    Descriptions,
} from 'antd';
import {
    EnvironmentOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    CalendarOutlined,
    ArrowLeftOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { planApi } from '../api/plan';
import type { TravelPlan, DailyItinerary } from '../types';
import TravelMap from '../components/TravelMap';
import ExpenseManager from '../components/ExpenseManager';
import dayjs from 'dayjs';
import './PlanDetail.css';

const { TabPane } = Tabs;

const PlanDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<TravelPlan | null>(null);
    const [itinerary, setItinerary] = useState<DailyItinerary[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<number>(1);

    useEffect(() => {
        if (id) {
            fetchPlanDetail(id);
        }
    }, [id]);

    const fetchPlanDetail = async (planId: string) => {
        setLoading(true);
        try {
            const response = await planApi.getPlan(planId);
            if (response.success && response.data) {
                setPlan(response.data.plan);
                setItinerary(response.data.dailyItinerary || []);
                if (response.data.dailyItinerary.length > 0) {
                    setSelectedDay(response.data.dailyItinerary[0].day);
                }
            }
        } catch (error) {
            console.error('Failed to fetch plan detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const getItemIcon = (type?: string) => {
        const icons: Record<string, string> = {
            交通: '🚗',
            住宿: '🏨',
            餐饮: '🍴',
            景点: '🎯',
            其他: '📍',
        };
        return icons[type || '其他'] || '📍';
    };

    const getItemColor = (type?: string) => {
        const colors: Record<string, string> = {
            交通: 'blue',
            住宿: 'green',
            餐饮: 'orange',
            景点: 'red',
            其他: 'default',
        };
        return colors[type || '其他'] || 'default';
    };

    const calculateTotalCost = () => {
        return itinerary.reduce((total, day) => {
            return (
                total +
                day.items.reduce((dayTotal, item) => {
                    return dayTotal + (item.cost || item.estimated_cost || 0);
                }, 0)
            );
        }, 0);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="empty-container">
                <Empty description="计划不存在" />
                <Button type="primary" onClick={() => navigate('/plans')}>
                    返回计划列表
                </Button>
            </div>
        );
    }

    return (
        <div className="plan-detail-container">
            {/* 页面头部 */}
            <div className="detail-header">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/plans')}
                    type="text"
                    size="large"
                >
                    返回
                </Button>
                <div className="header-content">
                    <h1 className="plan-title">{plan.title}</h1>
                    <div className="plan-meta">
                        <span>
                            <EnvironmentOutlined /> {plan.destination}
                        </span>
                        <span>
                            <CalendarOutlined />{' '}
                            {dayjs(plan.start_date).format('YYYY-MM-DD')} 至{' '}
                            {dayjs(plan.end_date).format('YYYY-MM-DD')}
                        </span>
                        {plan.travelers_count && (
                            <span>
                                <TeamOutlined /> {plan.travelers_count} 人
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 统计卡片 */}
            <Row gutter={[16, 16]} className="stats-row">
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="总预算"
                            value={plan.budget || 0}
                            prefix="¥"
                            valueStyle={{ color: '#667eea' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="预计花费"
                            value={calculateTotalCost()}
                            prefix="¥"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="行程天数"
                            value={itinerary.length}
                            suffix="天"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="景点数量"
                            value={itinerary.reduce(
                                (count, day) =>
                                    count + day.items.filter((item) => (item.type || item.item_type) === '景点').length,
                                0
                            )}
                            suffix="个"
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 主要内容区 */}
            <Row gutter={[16, 16]} className="main-content-row">
                {/* 左侧：地图 */}
                <Col xs={24} lg={14}>
                    <Card className="map-card" bodyStyle={{ padding: 0, height: '600px' }}>
                        <TravelMap
                            itinerary={itinerary}
                            selectedDay={selectedDay}
                        />
                    </Card>
                </Col>

                {/* 右侧：行程详情 */}
                <Col xs={24} lg={10}>
                    <Card
                        className="itinerary-card"
                        title="行程安排"
                        bodyStyle={{ padding: 0, maxHeight: '600px', overflow: 'auto' }}
                    >
                        <Tabs
                            activeKey={selectedDay.toString()}
                            onChange={(key) => setSelectedDay(parseInt(key))}
                            className="day-tabs"
                        >
                            {itinerary.map((dayPlan) => (
                                <TabPane
                                    tab={`第${dayPlan.day}天`}
                                    key={dayPlan.day.toString()}
                                >
                                    <div className="day-content">
                                        {dayPlan.theme && (
                                            <div className="day-theme">
                                                <h3>{dayPlan.theme}</h3>
                                            </div>
                                        )}
                                        <Timeline>
                                            {dayPlan.items.map((item, index) => (
                                                <Timeline.Item
                                                    key={index}
                                                    dot={
                                                        <div className="timeline-dot">
                                                            {getItemIcon(item.type || item.item_type)}
                                                        </div>
                                                    }
                                                >
                                                    <div className="itinerary-item">
                                                        <div className="item-header">
                                                            <span className="item-title">{item.title}</span>
                                                            <Tag color={getItemColor(item.type || item.item_type)}>
                                                                {item.type || item.item_type}
                                                            </Tag>
                                                        </div>
                                                        {(item.time || item.start_time) && (
                                                            <div className="item-info">
                                                                <ClockCircleOutlined /> {item.time || item.start_time}
                                                            </div>
                                                        )}
                                                        {(item.cost !== undefined || item.estimated_cost !== undefined) && (
                                                            <div className="item-info">
                                                                <DollarOutlined /> ¥
                                                                {item.cost || item.estimated_cost}
                                                            </div>
                                                        )}
                                                        {item.description && (
                                                            <div className="item-description">
                                                                {item.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Timeline.Item>
                                            ))}
                                        </Timeline>
                                    </div>
                                </TabPane>
                            ))}
                        </Tabs>
                    </Card>
                </Col>
            </Row>

            {/* 费用管理 */}
            {id && (
                <Card className="expense-card" title="费用管理">
                    <ExpenseManager planId={id} budget={plan.budget || 0} />
                </Card>
            )}

            {/* 偏好信息 */}
            {plan.preferences && (
                <Card className="preferences-card" title="偏好设置">
                    <Descriptions column={1}>
                        {plan.preferences.interests && plan.preferences.interests.length > 0 && (
                            <Descriptions.Item label="兴趣偏好">
                                {plan.preferences.interests.map((interest) => (
                                    <Tag key={interest} color="blue">
                                        {interest}
                                    </Tag>
                                ))}
                            </Descriptions.Item>
                        )}
                        {plan.preferences.specialNeeds && plan.preferences.specialNeeds.length > 0 && (
                            <Descriptions.Item label="特殊需求">
                                {plan.preferences.specialNeeds.map((need) => (
                                    <Tag key={need} color="orange">
                                        {need}
                                    </Tag>
                                ))}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Card>
            )}
        </div>
    );
};

export default PlanDetail;
