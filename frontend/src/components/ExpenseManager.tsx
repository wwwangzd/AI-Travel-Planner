import React, { useEffect, useState } from 'react';
import {
    Button,
    Table,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    DatePicker,
    Progress,
    Row,
    Col,
    Statistic,
    Card,
    Tag,
    message,
    Divider,
    Alert,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    AudioOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import { expenseApi } from '../api/expense';
import { voiceApi } from '../api/voice';
import type { Expense, ExpenseSummary, ExpenseAnalysis, ItemType } from '../types';
import VoiceRecorder from './VoiceRecorder';
import dayjs from 'dayjs';
import './ExpenseManager.css';

interface ExpenseManagerProps {
    planId: string;
    budget: number;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ planId }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [summary, setSummary] = useState<ExpenseSummary | null>(null);
    const [analysis, setAnalysis] = useState<ExpenseAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [voiceModalVisible, setVoiceModalVisible] = useState(false);
    const [analysisVisible, setAnalysisVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchExpenses();
        fetchSummary();
    }, [planId]);

    const fetchExpenses = async () => {
        try {
            const response = await expenseApi.getExpenses(planId);
            if (response.success && response.data) {
                setExpenses(response.data.expenses);
            }
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await expenseApi.getExpenseSummary(planId);
            if (response.success && response.data) {
                setSummary(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch summary:', error);
        }
    };

    const handleAddExpense = async (values: any) => {
        setLoading(true);
        try {
            const response = await expenseApi.addExpense({
                planId,
                category: values.category,
                amount: values.amount,
                description: values.description,
                expenseDate: values.expenseDate.format('YYYY-MM-DD'),
            });

            if (response.success) {
                message.success('费用添加成功');
                setModalVisible(false);
                form.resetFields();
                fetchExpenses();
                fetchSummary();
            }
        } catch (error) {
            console.error('Failed to add expense:', error);
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

    const handleVoiceExpense = async (audioBlob: Blob) => {
        try {
            // 转换为 16kHz 单声道 PCM 原始数据，确保与科大讯飞 IAT 要求一致
            const pcmBlob = await convertToPCM16k(audioBlob);
            const audioFile = new File([pcmBlob], 'voice.pcm', { type: 'application/octet-stream' });
            
            const voiceResponse = await voiceApi.recognize(audioFile);

            if (voiceResponse.success && voiceResponse.data) {
                // 解析费用信息
                const parseResponse = await expenseApi.parseVoiceExpense({
                    text: voiceResponse.data.text,
                });

                if (parseResponse.success && parseResponse.data) {
                    form.setFieldsValue({
                        category: parseResponse.data.category,
                        amount: parseResponse.data.amount,
                        description: parseResponse.data.description,
                        expenseDate: dayjs(),
                    });
                    setVoiceModalVisible(false);
                    setModalVisible(true);
                    message.success('语音识别成功，请确认信息');
                }
            }
        } catch (error) {
            console.error('Voice expense failed:', error);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这条费用记录吗？',
            okText: '确认',
            cancelText: '取消',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await expenseApi.deleteExpense(id);
                    message.success('删除成功');
                    fetchExpenses();
                    fetchSummary();
                } catch (error) {
                    console.error('Failed to delete expense:', error);
                }
            },
        });
    };

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const response = await expenseApi.analyzeExpenses(planId);
            if (response.success && response.data) {
                setAnalysis(response.data);
                setAnalysisVisible(true);
            }
        } catch (error) {
            console.error('Failed to analyze expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: '日期',
            dataIndex: 'expense_date',
            key: 'expense_date',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
            width: 120,
        },
        {
            title: '类别',
            dataIndex: 'category',
            key: 'category',
            render: (category: ItemType) => {
                const colors: Record<ItemType, string> = {
                    交通: 'blue',
                    住宿: 'green',
                    餐饮: 'orange',
                    景点: 'red',
                    其他: 'default',
                };
                return <Tag color={colors[category]}>{category}</Tag>;
            },
            width: 100,
        },
        {
            title: '金额',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => `¥${amount.toFixed(2)}`,
            width: 120,
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: Expense) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteExpense(record.id)}
                >
                    删除
                </Button>
            ),
            width: 100,
        },
    ];

    const getStatusColor = () => {
        if (!summary) return 'normal';
        if (summary.percentage >= 100) return 'exception';
        if (summary.percentage >= 80) return 'exception';
        return 'active';
    };

    return (
        <div className="expense-manager">
            {/* 摘要卡片 */}
            {summary && (
                <Card className="summary-card" bordered={false}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Statistic
                                title="总支出"
                                value={summary.totalExpenses}
                                prefix="¥"
                                precision={2}
                                valueStyle={{ color: '#f5222d' }}
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Statistic
                                title="预算"
                                value={summary.budget}
                                prefix="¥"
                                precision={2}
                                valueStyle={{ color: '#667eea' }}
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Statistic
                                title="剩余"
                                value={summary.remaining}
                                prefix="¥"
                                precision={2}
                                valueStyle={{
                                    color: summary.remaining >= 0 ? '#52c41a' : '#f5222d',
                                }}
                            />
                        </Col>
                    </Row>
                    <Divider />
                    <div className="budget-progress">
                        <div className="progress-header">
                            <span>预算使用</span>
                            <span className="progress-percent">
                                {summary.percentage.toFixed(1)}%
                            </span>
                        </div>
                        <Progress
                            percent={Math.min(summary.percentage, 100)}
                            status={getStatusColor()}
                            strokeColor={{
                                '0%': '#667eea',
                                '100%': summary.percentage >= 80 ? '#f5222d' : '#52c41a',
                            }}
                        />
                    </div>
                </Card>
            )}

            {/* 操作按钮 */}
            <div className="action-buttons">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                >
                    添加费用
                </Button>
                <Button
                    icon={<AudioOutlined />}
                    onClick={() => setVoiceModalVisible(true)}
                >
                    语音记录
                </Button>
                <Button
                    icon={<BarChartOutlined />}
                    onClick={handleAnalyze}
                    loading={loading}
                >
                    AI分析
                </Button>
            </div>

            {/* 费用列表 */}
            <Table
                columns={columns}
                dataSource={expenses}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                className="expense-table"
            />

            {/* 添加费用弹窗 */}
            <Modal
                title="添加费用"
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleAddExpense}>
                    <Form.Item
                        name="category"
                        label="类别"
                        rules={[{ required: true, message: '请选择类别' }]}
                    >
                        <Select
                            options={[
                                { label: '交通', value: '交通' },
                                { label: '住宿', value: '住宿' },
                                { label: '餐饮', value: '餐饮' },
                                { label: '景点', value: '景点' },
                                { label: '其他', value: '其他' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="金额"
                        rules={[{ required: true, message: '请输入金额' }]}
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '100%' }}
                            prefix="¥"
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="描述"
                        rules={[{ required: true, message: '请输入描述' }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="expenseDate"
                        label="日期"
                        initialValue={dayjs()}
                        rules={[{ required: true, message: '请选择日期' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            确认添加
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 语音录制弹窗 */}
            <Modal
                title="语音记录费用"
                open={voiceModalVisible}
                onCancel={() => setVoiceModalVisible(false)}
                footer={null}
            >
                <VoiceRecorder onRecordingComplete={handleVoiceExpense} />
            </Modal>

            {/* AI分析结果弹窗 */}
            <Modal
                title="AI 费用分析"
                open={analysisVisible}
                onCancel={() => setAnalysisVisible(false)}
                footer={null}
                width={700}
            >
                {analysis && (
                    <div className="analysis-content">
                        <Alert
                            message={`预算状态：${analysis.budgetStatus}`}
                            description={analysis.spendingTrend}
                            type={
                                analysis.budgetStatus === '正常'
                                    ? 'success'
                                    : analysis.budgetStatus === '接近超支'
                                        ? 'warning'
                                        : 'error'
                            }
                            showIcon
                        />

                        <Divider />

                        <h3>建议</h3>
                        <ul className="suggestions-list">
                            {analysis.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>

                        <Divider />

                        <h3>预测</h3>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="预计总支出"
                                    value={analysis.forecast.estimatedTotal}
                                    prefix="¥"
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="风险等级"
                                    value={analysis.forecast.riskLevel}
                                    valueStyle={{
                                        color:
                                            analysis.forecast.riskLevel === '低'
                                                ? '#52c41a'
                                                : analysis.forecast.riskLevel === '中'
                                                    ? '#fa8c16'
                                                    : '#f5222d',
                                    }}
                                />
                            </Col>
                        </Row>

                        <Divider />

                        <h3>分类分析</h3>
                        {analysis.categoryAnalysis.map((cat) => (
                            <div key={cat.category} className="category-analysis-item">
                                <div className="category-header">
                                    <span>{cat.category}</span>
                                    <Tag
                                        color={
                                            cat.status === '合理'
                                                ? 'green'
                                                : cat.status === '偏高'
                                                    ? 'red'
                                                    : 'blue'
                                        }
                                    >
                                        {cat.status}
                                    </Tag>
                                </div>
                                <Progress
                                    percent={cat.percentage}
                                    strokeColor={
                                        cat.status === '合理'
                                            ? '#52c41a'
                                            : cat.status === '偏高'
                                                ? '#f5222d'
                                                : '#1890ff'
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ExpenseManager;
