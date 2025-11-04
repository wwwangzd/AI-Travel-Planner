import axios from 'axios';
import { ExtractedTravelInfo, GeneratedPlan, ExpenseAnalysis } from '../types/models';

export class LLMService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.LLM_API_KEY!;
    this.baseUrl = process.env.LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    this.model = process.env.LLM_MODEL || 'qwen-plus';

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

  /**
   * 步骤1: 从自然语言提取旅行需求
   */
  async extractTravelInfo(userInput: string): Promise<ExtractedTravelInfo> {
    const systemPrompt = `你是一个旅行需求分析助手。从用户的自然语言描述中提取旅行规划所需的关键信息。

要求：
1. 返回严格的 JSON 格式数据
2. 尽可能推断缺失的信息
3. 对不确定的信息标注 null
4. 识别用户偏好（兴趣、特殊需求）

返回格式:
{
  "destination": "目的地",
  "duration": 天数,
  "startDate": "起始日期或null",
  "endDate": "结束日期或null",
  "budget": 预算金额,
  "travelersCount": 人数,
  "preferences": {
    "interests": ["兴趣标签"],
    "specialNeeds": ["特殊需求标签，如：带孩子、带老人、无障碍需求等"]
  }
}`;

    const userPrompt = `用户输入：${userInput}`;

    const response = await this.chat(systemPrompt, userPrompt);
    return JSON.parse(response);
  }

  /**
   * 步骤2: 生成详细旅行计划
   */
  async generateTravelPlan(info: ExtractedTravelInfo): Promise<GeneratedPlan> {
    const systemPrompt = `你是一个专业的旅行规划助手。根据用户提供的结构化信息，生成详细的旅行计划。

要求：
1. 返回严格的 JSON 格式数据
2. 包含每日详细行程（交通、住宿、景点、餐饮）
3. 考虑时间合理性和地理位置
4. 严格控制在预算范围内
5. 充分考虑用户偏好
6. type 字段必须使用中文：交通、住宿、餐饮、景点、其他

返回格式：
{
  "title": "行程标题",
  "dailyItinerary": [
    {
      "day": 1,
      "date": "2025-12-01",
      "theme": "主题",
      "items": [
        {
          "type": "交通|住宿|餐饮|景点|其他",
          "title": "名称",
          "time": "HH:MM",
          "cost": 金额,
          "location": {"lat": 纬度, "lng": 经度},
          "description": "描述"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "交通": 金额,
    "住宿": 金额,
    "餐饮": 金额,
    "景点": 金额,
    "其他": 金额
  }
}`;

    const userPrompt = `请生成旅行计划：
${JSON.stringify(info, null, 2)}`;

    const response = await this.chat(systemPrompt, userPrompt);
    return JSON.parse(response);
  }

  /**
   * 解析语音费用记录
   */
  async parseExpenseFromVoice(text: string): Promise<{ category: string; amount: number; description: string }> {
    const systemPrompt = `你是一个费用记录助手。从用户的自然语言描述中提取费用信息。

要求：
1. 返回严格的 JSON 格式
2. 类型必须是中文：交通、住宿、餐饮、景点、其他
3. 金额必须是数字
4. 自动推断合适的类别

返回格式：
{
  "category": "类型（交通|住宿|餐饮|景点|其他）",
  "amount": 金额,
  "description": "描述"
}`;

    const userPrompt = `解析费用记录："${text}"`;

    const response = await this.chat(systemPrompt, userPrompt);
    return JSON.parse(response);
  }

  /**
   * AI 费用分析
   */
  async analyzeExpenses(params: {
    budget: number;
    totalExpenses: number;
    remainingDays: number;
    totalDays: number;
    expensesByCategory: Record<string, number>;
  }): Promise<ExpenseAnalysis> {
    const systemPrompt = `你是一个旅行财务分析师。根据旅行预算和实际支出情况，提供专业的分析和建议。

要求：
1. 返回严格的 JSON 格式
2. 分析预算使用情况
3. 预测剩余行程的开销
4. 给出具体的节省或调整建议
5. 评估超支风险

返回格式：
{
  "budgetStatus": "正常|接近超支|已超支",
  "spendingTrend": "描述消费趋势",
  "suggestions": ["具体建议"],
  "forecast": {
    "estimatedTotal": 预测总额,
    "riskLevel": "低|中|高"
  },
  "categoryAnalysis": [
    {
      "category": "类型",
      "percentage": 占比,
      "status": "合理|偏高|偏低"
    }
  ]
}`;

    const userPrompt = `分析旅行费用情况：
${JSON.stringify(params, null, 2)}`;

    const response = await this.chat(systemPrompt, userPrompt);
    return JSON.parse(response);
  }
}

export const llmService = new LLMService();
