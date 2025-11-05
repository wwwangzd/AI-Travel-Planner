import React, { useState } from 'react';
import {
    Card,
    Steps,
    Button,
    Input,
    Form,
    DatePicker,
    InputNumber,
    Select,
    message,
    Modal,
} from 'antd';
import {
    AudioOutlined,
    FormOutlined,
    CheckOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { planApi } from '../api/plan';
import { voiceApi } from '../api/voice';
import { preferenceApi } from '../api/preference';
import type { UserPreferences } from '../types';
import dayjs from 'dayjs';
import VoiceRecorder from '../components/VoiceRecorder';
import './CreatePlan.css';

const { Step } = Steps;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const CreatePlan: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // 加载用户偏好
    React.useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const response = await preferenceApi.getPreferences();
            if (response.success && response.data) {
                setPreferences(response.data);
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }
    };

    // 步骤1: 输入需求
    const handleExtract = async () => {
        if (!userInput.trim()) {
            message.warning('请输入您的旅行需求');
            return;
        }

        setLoading(true);
        try {
            const response = await planApi.extract({ userInput });
            if (response.success && response.data) {
                const info = response.data;

                // 如果没有偏好，使用用户默认偏好
                if (preferences && (!info.preferences || info.preferences.interests.length === 0)) {
                    info.preferences = preferences;
                }

                // 填充表单
                form.setFieldsValue({
                    destination: info.destination,
                    dates: info.startDate && info.endDate
                        ? [dayjs(info.startDate), dayjs(info.endDate)]
                        : null,
                    budget: info.budget,
                    travelersCount: info.travelersCount,
                    interests: info.preferences?.interests || [],
                    specialNeeds: info.preferences?.specialNeeds || [],
                });

                setCurrent(1);
                message.success('需求提取成功，请确认信息');
            }
        } catch (error) {
            console.error('Extract failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // 语音识别回调
    const handleVoiceRecognition = async (audioBlob: Blob) => {
        try {
            const audioFile = new File([audioBlob], 'voice.wav', { type: 'audio/wav' });
            const response = await voiceApi.recognize(audioFile);

            if (response.success && response.data) {
                setUserInput(response.data.text);
                setShowVoiceModal(false);
                message.success('语音识别成功');
            }
        } catch (error) {
            console.error('Voice recognition failed:', error);
        }
    };

    // 步骤2: 确认信息并生成计划
    const handleGenerate = async (values: any) => {
        setGenerating(true);
        try {
            const [startDate, endDate] = values.dates;
            const params = {
                destination: values.destination,
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
                budget: values.budget,
                travelersCount: values.travelersCount,
                preferences: {
                    interests: values.interests || [],
                    specialNeeds: values.specialNeeds || [],
                },
            };

            const response = await planApi.generate(params);
            if (response.success && response.data) {
                message.success('旅行计划生成成功！');
                navigate(`/plans/${response.data.planId}`);
            }
        } catch (error) {
            console.error('Generate plan failed:', error);
        } finally {
            setGenerating(false);
        }
    };

    const steps = [
        {
            title: '描述需求',
            icon: <FormOutlined />,
        },
        {
            title: '确认信息',
            icon: <CheckOutlined />,
        },
        {
            title: '生成计划',
            icon: <RocketOutlined />,
        },
    ];

    const commonInterests = [
        '美食', '历史文化', '自然风光', '购物', '摄影',
        '动漫', '温泉', '滑雪', '海滩', '登山',
    ];

    const commonSpecialNeeds = [
        '带孩子', '带老人', '无障碍需求', '素食', '宠物友好',
    ];

    return (
        <div className="create-plan-container">
            <Card className="create-plan-card">
                <Steps current={current} className="steps">
                    {steps.map((item) => (
                        <Step key={item.title} title={item.title} icon={item.icon} />
                    ))}
                </Steps>

                <div className="steps-content">
                    {current === 0 && (
                        <div className="step-content">
                            <h2>描述您的旅行需求</h2>
                            <p className="step-description">
                                您可以用自然语言描述，例如："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
                            </p>
                            <TextArea
                                rows={6}
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="请输入您的旅行需求..."
                                className="input-area"
                            />
                            <div className="button-group">
                                <Button
                                    type="default"
                                    icon={<AudioOutlined />}
                                    size="large"
                                    onClick={() => setShowVoiceModal(true)}
                                >
                                    语音输入
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleExtract}
                                    loading={loading}
                                >
                                    提取信息
                                </Button>
                            </div>
                        </div>
                    )}

                    {current === 1 && (
                        <div className="step-content">
                            <h2>确认旅行信息</h2>
                            <p className="step-description">请检查并完善以下信息</p>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleGenerate}
                                className="confirm-form"
                            >
                                <Form.Item
                                    label="目的地"
                                    name="destination"
                                    rules={[{ required: true, message: '请输入目的地' }]}
                                >
                                    <Input size="large" placeholder="例如：日本" />
                                </Form.Item>

                                <Form.Item
                                    label="旅行日期"
                                    name="dates"
                                    rules={[{ required: true, message: '请选择旅行日期' }]}
                                >
                                    <RangePicker size="large" style={{ width: '100%' }} />
                                </Form.Item>

                                <Form.Item
                                    label="预算（元）"
                                    name="budget"
                                    rules={[{ required: true, message: '请输入预算' }]}
                                >
                                    <InputNumber
                                        size="large"
                                        min={0}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="同行人数"
                                    name="travelersCount"
                                    rules={[{ required: true, message: '请输入同行人数' }]}
                                >
                                    <InputNumber size="large" min={1} style={{ width: '100%' }} />
                                </Form.Item>

                                <Form.Item label="兴趣偏好" name="interests">
                                    <Select
                                        mode="tags"
                                        size="large"
                                        placeholder="选择或输入兴趣偏好"
                                        options={commonInterests.map((item) => ({ label: item, value: item }))}
                                    />
                                </Form.Item>

                                <Form.Item label="特殊需求" name="specialNeeds">
                                    <Select
                                        mode="tags"
                                        size="large"
                                        placeholder="选择或输入特殊需求"
                                        options={commonSpecialNeeds.map((item) => ({ label: item, value: item }))}
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <div className="button-group">
                                        <Button size="large" onClick={() => setCurrent(0)}>
                                            上一步
                                        </Button>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            loading={generating}
                                            icon={<RocketOutlined />}
                                        >
                                            生成旅行计划
                                        </Button>
                                    </div>
                                </Form.Item>
                            </Form>
                        </div>
                    )}
                </div>
            </Card>

            <Modal
                title="语音输入"
                open={showVoiceModal}
                onCancel={() => setShowVoiceModal(false)}
                footer={null}
                width={500}
            >
                <VoiceRecorder onRecordingComplete={handleVoiceRecognition} />
            </Modal>
        </div>
    );
};

export default CreatePlan;
