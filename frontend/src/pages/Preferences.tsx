import React, { useEffect, useState } from 'react';
import { Card, Form, Select, Button, message, Space, Divider, Alert } from 'antd';
import { SaveOutlined, SyncOutlined } from '@ant-design/icons';
import { preferenceApi } from '../api/preference';
import type { UserPreferences } from '../types';
import './Preferences.css';

const Preferences: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [learning, setLearning] = useState(false);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await preferenceApi.getPreferences();
            if (response.success && response.data) {
                form.setFieldsValue({
                    interests: response.data.interests,
                    specialNeeds: response.data.specialNeeds,
                });
            }
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
        }
    };

    const handleSave = async (values: UserPreferences) => {
        setLoading(true);
        try {
            const response = await preferenceApi.updatePreferences(values);
            if (response.success) {
                message.success('偏好设置已保存');
            }
        } catch (error) {
            console.error('Failed to save preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLearn = async () => {
        setLearning(true);
        try {
            const response = await preferenceApi.learnPreferences();
            if (response.success && response.data) {
                message.success('已从历史计划中学习并更新偏好');
                form.setFieldsValue({
                    interests: response.data.interests,
                    specialNeeds: response.data.specialNeeds,
                });
            }
        } catch (error) {
            console.error('Failed to learn preferences:', error);
        } finally {
            setLearning(false);
        }
    };

    const commonInterests = [
        '美食',
        '历史文化',
        '自然风光',
        '购物',
        '摄影',
        '动漫',
        '温泉',
        '滑雪',
        '海滩',
        '登山',
        '博物馆',
        '艺术',
        '音乐',
        '体育',
        '夜生活',
        '主题公园',
        '徒步',
        '骑行',
        '潜水',
        '冲浪',
    ];

    const commonSpecialNeeds = [
        '带孩子',
        '带老人',
        '无障碍需求',
        '素食',
        '宠物友好',
        '清真餐饮',
        '过敏体质',
        '行动不便',
        '哺乳期',
        '孕妇',
    ];

    return (
        <div className="preferences-container">
            <Card
                title={<h2>偏好设置</h2>}
                className="preferences-card"
                extra={
                    <Button
                        icon={<SyncOutlined />}
                        onClick={handleLearn}
                        loading={learning}
                    >
                        从历史计划学习
                    </Button>
                }
            >
                <Alert
                    message="提示"
                    description="这些偏好将在创建新计划时自动应用，您也可以在创建计划时临时修改。系统可以从您的历史计划中学习常用的偏好。"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{
                        interests: [],
                        specialNeeds: [],
                    }}
                >
                    <Form.Item
                        name="interests"
                        label={
                            <span className="form-label">
                                <span className="label-icon">❤️</span>
                                兴趣偏好
                            </span>
                        }
                    >
                        <Select
                            mode="tags"
                            size="large"
                            placeholder="选择或输入您的兴趣偏好"
                            style={{ width: '100%' }}
                            options={commonInterests.map((item) => ({
                                label: item,
                                value: item,
                            }))}
                            maxTagCount="responsive"
                        />
                    </Form.Item>

                    <div className="interests-preview">
                        {commonInterests.slice(0, 10).map((interest) => (
                            <div
                                key={interest}
                                className="interest-tag"
                                onClick={() => {
                                    const current = form.getFieldValue('interests') || [];
                                    if (!current.includes(interest)) {
                                        form.setFieldsValue({
                                            interests: [...current, interest],
                                        });
                                    }
                                }}
                            >
                                {interest}
                            </div>
                        ))}
                    </div>

                    <Divider />

                    <Form.Item
                        name="specialNeeds"
                        label={
                            <span className="form-label">
                                <span className="label-icon">⚠️</span>
                                特殊需求
                            </span>
                        }
                    >
                        <Select
                            mode="tags"
                            size="large"
                            placeholder="选择或输入您的特殊需求"
                            style={{ width: '100%' }}
                            options={commonSpecialNeeds.map((item) => ({
                                label: item,
                                value: item,
                            }))}
                            maxTagCount="responsive"
                        />
                    </Form.Item>

                    <div className="interests-preview">
                        {commonSpecialNeeds.slice(0, 10).map((need) => (
                            <div
                                key={need}
                                className="interest-tag special-need-tag"
                                onClick={() => {
                                    const current = form.getFieldValue('specialNeeds') || [];
                                    if (!current.includes(need)) {
                                        form.setFieldsValue({
                                            specialNeeds: [...current, need],
                                        });
                                    }
                                }}
                            >
                                {need}
                            </div>
                        ))}
                    </div>

                    <Divider />

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                size="large"
                                loading={loading}
                            >
                                保存设置
                            </Button>
                            <Button size="large" onClick={() => form.resetFields()}>
                                重置
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            {/* 偏好说明卡片 */}
            <Card className="help-card" title="偏好设置说明">
                <div className="help-content">
                    <h4>💡 兴趣偏好</h4>
                    <p>
                        选择您在旅行中感兴趣的活动和主题，系统会根据这些偏好为您推荐合适的景点、餐厅和活动。
                    </p>

                    <h4>💡 特殊需求</h4>
                    <p>
                        告诉我们您的特殊需求，我们会在规划行程时特别考虑，确保行程适合所有同行人员。
                    </p>

                    <h4>💡 智能学习</h4>
                    <p>
                        点击"从历史计划学习"按钮，系统会分析您过往的旅行计划，自动提取常用的偏好并更新设置。
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Preferences;
