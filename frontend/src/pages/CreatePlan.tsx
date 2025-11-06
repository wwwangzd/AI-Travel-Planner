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

    // 将任意音频 Blob 转为 16kHz 单声道 PCM 原始数据
    const convertToPCM16k = async (blob: Blob): Promise<Blob> => {
        const arrayBuffer = await blob.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

        // 仅取第一个声道
        const channelData = decodedBuffer.getChannelData(0);
        const sourceSampleRate = decodedBuffer.sampleRate;
        const targetSampleRate = 16000;

        // 若采样率已为 16k，直接使用；否则进行重采样（简单均值法，避免引入重型依赖）
        let floatData: Float32Array;
        if (sourceSampleRate === targetSampleRate) {
            floatData = channelData;
        } else {
            const ratio = sourceSampleRate / targetSampleRate;
            const newLength = Math.round(channelData.length / ratio);
            floatData = new Float32Array(newLength);
            let offsetBuffer = 0;
            for (let i = 0; i < newLength; i++) {
                const nextOffsetBuffer = Math.round((i + 1) * ratio);
                let accum = 0;
                let count = 0;
                for (let j = offsetBuffer; j < nextOffsetBuffer && j < channelData.length; j++) {
                    accum += channelData[j];
                    count++;
                }
                floatData[i] = count > 0 ? accum / count : 0;
                offsetBuffer = nextOffsetBuffer;
            }
        }

        // Float32 [-1,1] 转 Int16 Little Endian 原始 PCM
        const pcmBuffer = new ArrayBuffer(floatData.length * 2);
        const view = new DataView(pcmBuffer);
        let offset = 0;
        for (let i = 0; i < floatData.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, floatData[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        }

        // 返回原始 PCM 数据（不带 WAV 头），后端按讯飞要求以 raw L16 发送
        return new Blob([pcmBuffer], { type: 'application/octet-stream' });
    };

    // 语音识别回调
    const handleVoiceRecognition = async (audioBlob: Blob) => {
        try {
            // 转换为 16kHz 单声道 PCM 原始数据，确保与科大讯飞 IAT 要求一致
            const pcmBlob = await convertToPCM16k(audioBlob);
            const audioFile = new File([pcmBlob], 'voice.pcm', { type: 'application/octet-stream' });

            const response = await voiceApi.recognize(audioFile);

            if (response.success && response.data) {
                if (response.data.text && response.data.text.trim().length > 0) {
                    setUserInput(response.data.text);
                    setShowVoiceModal(false);
                    message.success('语音识别成功');
                } else {
                    message.warning('没有识别到有效语音，请重试');
                }
            }
        } catch (error) {
            console.error('Voice recognition failed:', error);
            message.error('语音识别失败，请重试');
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
                                您可以用自然语言描述，例如："我想去南京，5天，预算5000，喜欢美食，带孩子"
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
