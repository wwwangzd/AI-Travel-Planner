import axios from 'axios';

export class LLMService {
    private apiKey: string;
    private baseUrl: string;
    private model: string;

    constructor() {
        this.apiKey = process.env.LLM_API_KEY!;
        this.baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
        this.model = process.env.LLM_MODEL || 'gpt-4';

        if (!this.apiKey) {
            throw new Error('LLM_API_KEY is not set');
        }
    }

    async chat(systemPrompt: string, userPrompt: string): Promise<string> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7,
                    response_format: { type: 'json_object' }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error: any) {
            console.error('LLM API Error:', error.response?.data || error.message);
            throw new Error('Failed to generate content from LLM');
        }
    }

    async generateTravelPlan(params: {
        destination: string;
        startDate: string;
        endDate: string;
        budget: number;
        travelersCount: number;
        preferences: any;
    }): Promise<any> {
        const days = this.calculateDays(params.startDate, params.endDate);

        const systemPrompt = `你是一个专业的旅行规划助手。根据用户提供的信息，生成详细的旅行计划。

要求：
1. 返回 JSON 格式数据
2. 包含每日详细行程
3. 包含交通、住宿、景点、餐厅推荐
4. 考虑时间合理性和地理位置
5. 严格控制在预算范围内
6. 根据偏好推荐合适的活动`;

        const userPrompt = `请为我规划一次旅行：
- 目的地：${params.destination}
- 日期：${params.startDate} 至 ${params.endDate}（共 ${days} 天）
- 预算：${params.budget} 元
- 人数：${params.travelersCount} 人
- 偏好：${JSON.stringify(params.preferences)}

请返回以下 JSON 格式：
{
  "title": "行程标题",
  "overview": "行程概述",
  "dailyItinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "主题",
      "items": [
        {
          "type": "transportation|accommodation|attraction|restaurant|activity",
          "time": "HH:MM",
          "title": "名称",
          "description": "描述",
          "location": "地址",
          "estimatedCost": 金额,
          "tips": "提示"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "transportation": 金额,
    "accommodation": 金额,
    "food": 金额,
    "activities": 金额,
    "reserve": 金额
  },
  "tips": ["旅行提示1", "旅行提示2"]
}`;

        const response = await this.chat(systemPrompt, userPrompt);
        return JSON.parse(response);
    }

    async analyzeBudget(params: {
        destination: string;
        days: number;
        budget: number;
        travelersCount: number;
    }): Promise<any> {
        const systemPrompt = '你是一个旅行预算分析专家，帮助用户合理分配旅行预算。返回 JSON 格式。';

        const userPrompt = `分析旅行预算分配：
- 目的地：${params.destination}
- 天数：${params.days}
- 总预算：${params.budget} 元
- 人数：${params.travelersCount}

请返回 JSON 格式：
{
  "totalBudget": ${params.budget},
  "allocation": {
    "transportation": 金额,
    "accommodation": 金额,
    "food": 金额,
    "activities": 金额,
    "reserve": 金额
  },
  "suggestions": ["建议1", "建议2"]
}`;

        const response = await this.chat(systemPrompt, userPrompt);
        return JSON.parse(response);
    }

    async parseExpenseFromVoice(text: string): Promise<any> {
        const systemPrompt = '你是一个费用记录助手。从用户的语音输入中提取费用信息。返回 JSON 格式。';

        const userPrompt = `解析这条费用记录："${text}"

返回 JSON 格式：
{
  "category": "分类（如：餐饮、交通、住宿、购物、娱乐等）",
  "amount": 金额（数字）,
  "description": "描述"
}`;

        const response = await this.chat(systemPrompt, userPrompt);
        return JSON.parse(response);
    }

    private calculateDays(startDate: string, endDate: string): number {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1;
    }
}

export const llmService = new LLMService();
