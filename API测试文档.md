# AI 旅行规划师 API 测试文档

本文档提供完整的 API 接口测试用例，可直接在 Apifox、Postman 等工具中使用。

## 基础信息

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)

## 环境变量配置建议（Apifox/Postman）

建议在测试工具中配置以下环境变量：

```
base_url = http://localhost:3000
token = (登录后自动设置)
plan_id = (生成计划后自动设置)
expense_id = (添加费用后自动设置)
```

---

## 1. 认证模块

### 1.1 用户注册

**接口**: `POST /api/auth/register`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "email": "test@example.com",
  "password": "123456",
  "username": "测试用户"
}
```

**成功响应** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "username": "测试用户"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**失败响应** (400):
```json
{
  "success": false,
  "error": "Email already registered"
}
```

---

### 1.2 用户登录

**接口**: `POST /api/auth/login`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "username": "测试用户"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**失败响应** (401):
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### 1.3 获取用户信息

**接口**: `GET /api/auth/profile`

**请求头**:
```
Authorization: Bearer {token}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "username": "测试用户",
      "avatar_url": null,
      "created_at": "2025-11-01T00:00:00.000Z"
    }
  }
}
```

---

## 2. 行程规划模块

### 2.1 提取旅行需求信息

**接口**: `POST /api/plans/extract`

**描述**: 从用户的自然语言输入中提取结构化的旅行需求信息

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "userInput": "我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "destination": "日本",
    "duration": 5,
    "startDate": null,
    "endDate": null,
    "budget": 10000,
    "travelersCount": 2,
    "preferences": {
      "interests": ["美食", "动漫"],
      "specialNeeds": ["带孩子"]
    }
  }
}
```

**测试用例 2**:
```json
{
  "userInput": "下个月去成都玩3天，两个人，大概5000块钱，想吃火锅看熊猫"
}
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "destination": "成都",
    "duration": 3,
    "startDate": null,
    "endDate": null,
    "budget": 5000,
    "travelersCount": 2,
    "preferences": {
      "interests": ["美食", "自然风光"],
      "specialNeeds": []
    }
  }
}
```

**失败响应** (400):
```json
{
  "success": false,
  "error": "Validation error",
  "details": [...]
}
```

---

### 2.2 生成旅行计划

**接口**: `POST /api/plans/generate`

**描述**: 基于结构化的旅行需求信息生成详细的旅行计划

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "destination": "日本",
  "startDate": "2025-12-01",
  "endDate": "2025-12-05",
  "budget": 10000,
  "travelersCount": 2,
  "preferences": {
    "interests": ["美食", "动漫"],
    "specialNeeds": ["带孩子"]
  }
}
```

**成功响应** (201):
```json
{
  "success": true,
  "data": {
    "planId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "日本东京5日亲子美食动漫之旅",
    "itinerary": [
      {
        "day": 1,
        "date": "2025-12-01",
        "theme": "东京初体验",
        "items": [
          {
            "type": "交通",
            "title": "上海 → 东京（成田机场）",
            "time": "08:00",
            "cost": 2000,
            "description": "建议预订国航CA929航班，飞行时长约3小时",
            "location": {
              "lat": 35.7720,
              "lng": 140.3929
            }
          },
          {
            "type": "住宿",
            "title": "东京湾希尔顿酒店",
            "time": "14:00",
            "cost": 800,
            "description": "位于台场，交通便利，适合亲子出行",
            "location": {
              "lat": 35.6272,
              "lng": 139.7815
            }
          },
          {
            "type": "景点",
            "title": "台场海滨公园",
            "time": "16:00",
            "cost": 0,
            "description": "欣赏东京湾美景，孩子可以在沙滩玩耍",
            "location": {
              "lat": 35.6295,
              "lng": 139.7748
            }
          },
          {
            "type": "餐饮",
            "title": "一兰拉面（台场店）",
            "time": "18:30",
            "cost": 100,
            "description": "品尝正宗日式拉面",
            "location": {
              "lat": 35.6262,
              "lng": 139.7745
            }
          }
        ]
      },
      {
        "day": 2,
        "date": "2025-12-02",
        "theme": "动漫圣地巡礼",
        "items": [
          {
            "type": "餐饮",
            "title": "酒店早餐",
            "time": "08:00",
            "cost": 0,
            "description": "酒店自助早餐"
          },
          {
            "type": "景点",
            "title": "秋叶原动漫街",
            "time": "10:00",
            "cost": 500,
            "description": "探索动漫天堂，购买周边产品",
            "location": {
              "lat": 35.7022,
              "lng": 139.7730
            }
          },
          {
            "type": "餐饮",
            "title": "动漫主题咖啡厅",
            "time": "12:30",
            "cost": 200,
            "description": "体验特色主题餐厅"
          },
          {
            "type": "景点",
            "title": "东京迪士尼乐园",
            "time": "14:00",
            "cost": 1200,
            "description": "适合全家游玩的主题乐园",
            "location": {
              "lat": 35.6329,
              "lng": 139.8804
            }
          },
          {
            "type": "餐饮",
            "title": "园内晚餐",
            "time": "18:00",
            "cost": 150,
            "description": "在乐园内用餐"
          }
        ]
      }
    ],
    "budgetBreakdown": {
      "交通": 4000,
      "住宿": 3200,
      "餐饮": 1500,
      "景点": 1300,
      "其他": 0
    }
  }
}
```

**失败响应** (400):
```json
{
  "success": false,
  "error": "Validation error",
  "details": [...]
}
```

**说明**：
- `type` 字段使用中文标签：交通、住宿、餐饮、景点、其他
- LLM 生成过程可能需要 10-30 秒，请设置合理的超时时间
- 生成的行程会自动保存到数据库

---

### 2.3 获取所有旅行计划

**接口**: `GET /api/plans`

**请求头**:
```
Authorization: Bearer {token}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "title": "日本5日游",
        "destination": "日本",
        "start_date": "2025-12-01",
        "end_date": "2025-12-05",
        "budget": 10000,
        "travelers_count": 2,
        "preferences": {...},
        "status": "draft",
        "created_at": "2025-11-01T00:00:00.000Z",
        "updated_at": "2025-11-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 2.4 获取单个旅行计划详情

**接口**: `GET /api/plans/:id`

**请求头**:
```
Authorization: Bearer {token}
```

**URL 参数**:
- `id`: 计划ID (UUID)

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "uuid",
      "user_id": "uuid",
      "title": "日本5日游",
      "destination": "日本",
      "start_date": "2025-12-01",
      "end_date": "2025-12-05",
      "budget": 10000,
      "travelers_count": 2,
      "preferences": {...},
      "status": "draft",
      "created_at": "2025-11-01T00:00:00.000Z",
      "updated_at": "2025-11-01T00:00:00.000Z"
    },
    "dailyItinerary": [
      {
        "day": 1,
        "items": [
          {
            "id": "uuid",
            "plan_id": "uuid",
            "day_number": 1,
            "item_type": "transportation",
            "title": "上海 → 东京",
            "description": "...",
            "location": {...},
            "start_time": "08:00:00",
            "end_time": null,
            "estimated_cost": 2000,
            "booking_info": {...},
            "sort_order": 0,
            "created_at": "2025-11-01T00:00:00.000Z"
          }
        ]
      }
    ]
  }
}
```

**失败响应** (404):
```json
{
  "success": false,
  "error": "Plan not found"
}
```

---

### 2.5 更新旅行计划

**接口**: `PUT /api/plans/:id`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**URL 参数**:
- `id`: 计划ID (UUID)

**请求体**:
```json
{
  "title": "日本东京5日深度游",
  "budget": 12000,
  "status": "confirmed"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "uuid",
      "title": "日本东京5日深度游",
      "budget": 12000,
      "status": "confirmed",
      ...
    }
  }
}
```

---

### 2.6 删除旅行计划

**接口**: `DELETE /api/plans/:id`

**请求头**:
```
Authorization: Bearer {token}
```

**URL 参数**:
- `id`: 计划ID (UUID)

**成功响应** (200):
```json
{
  "success": true,
  "message": "Plan deleted successfully"
}
```

---

## 3. 费用管理模块

### 3.1 解析语音费用

**接口**: `POST /api/expenses/parse`

**描述**: 使用 LLM 从自然语言中解析费用信息

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "text": "午餐吃拉面花了150元"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "category": "餐饮",
    "amount": 150,
    "description": "午餐 - 拉面"
  }
}
```

**测试用例 2**:
```json
{
  "text": "打车去机场花了200块钱"
}
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "category": "交通",
    "amount": 200,
    "description": "打车去机场"
  }
}
```

**测试用例 3**:
```json
{
  "text": "在东京塔买了纪念品500日元"
}
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "category": "其他",
    "amount": 500,
    "description": "在东京塔买纪念品"
  }
}
```

**说明**：
- category 字段值为中文：交通、住宿、餐饮、景点、其他
- LLM 会自动推断合适的类别
- 金额会自动提取为数字

---

### 3.2 添加费用记录

**接口**: `POST /api/expenses`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "planId": "550e8400-e29b-41d4-a716-446655440000",
  "category": "餐饮",
  "amount": 150.50,
  "description": "午餐 - 一兰拉面",
  "expenseDate": "2025-12-01",
  "currency": "CNY"
}
```

**成功响应** (201):
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "plan_id": "550e8400-e29b-41d4-a716-446655440000",
    "category": "餐饮",
    "amount": 150.50,
    "currency": "CNY",
    "description": "午餐 - 一兰拉面",
    "expense_date": "2025-12-01",
    "created_at": "2025-11-04T00:00:00.000Z"
  }
}
```

**说明**：
- `category` 必须是以下之一：交通、住宿、餐饮、景点、其他
- `planId` 必须是有效的计划 ID（UUID 格式）
- 只能为自己的计划添加费用

---

### 3.3 获取费用记录列表

**接口**: `GET /api/expenses/:planId`

**请求头**:
```
Authorization: Bearer {token}
```

**URL 参数**:
- `planId`: 计划ID (UUID)

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "uuid",
        "plan_id": "uuid",
        "category": "餐饮",
        "amount": 150.50,
        "currency": "CNY",
        "description": "午餐 - 一兰拉面",
        "expense_date": "2025-12-01",
        "created_by": "uuid",
        "created_at": "2025-11-01T00:00:00.000Z"
      },
      {
        "id": "uuid",
        "plan_id": "uuid",
        "category": "交通",
        "amount": 50,
        "currency": "CNY",
        "description": "地铁",
        "expense_date": "2025-12-01",
        "created_by": "uuid",
        "created_at": "2025-11-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 3.4 获取费用统计汇总

**接口**: `GET /api/expenses/:planId/summary`

**请求头**:
```
Authorization: Bearer {token}
```

**URL 参数**:
- `planId`: 计划ID (UUID)

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "totalExpenses": 5678.90,
    "budget": 10000,
    "remaining": 4321.10,
    "percentage": 56.79,
    "breakdown": {
      "交通": 2000,
      "住宿": 2000,
      "餐饮": 1500,
      "景点": 178.90,
      "其他": 0
    }
  }
}
```

**说明**：
- `breakdown` 按照统一的 5 个中文类别分类
- `percentage` 表示已使用预算的百分比

---

### 3.5 AI 费用分析

**接口**: `POST /api/expenses/:planId/analyze`

**描述**: 使用 AI 分析预算使用情况，提供消费建议

**请求头**:
```
Authorization: Bearer {token}
```

**URL 参数**:
- `planId`: 计划ID (UUID)

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "budgetStatus": "正常",
    "spendingTrend": "消费较为平稳，整体控制良好",
    "suggestions": [
      "餐饮支出占比26.4%，略高于一般水平，建议适当控制",
      "交通支出占比35.2%，符合长途旅行的正常水平",
      "还剩2天行程，剩余预算4321元充足，可以适当增加景点游览"
    ],
    "forecast": {
      "estimatedTotal": 9800,
      "riskLevel": "低"
    },
    "categoryAnalysis": [
      {
        "category": "交通",
        "percentage": 35.2,
        "status": "合理"
      },
      {
        "category": "住宿",
        "percentage": 35.2,
        "status": "合理"
      },
      {
        "category": "餐饮",
        "percentage": 26.4,
        "status": "偏高"
      },
      {
        "category": "景点",
        "percentage": 3.2,
        "status": "偏低"
      },
      {
        "category": "其他",
        "percentage": 0,
        "status": "偏低"
      }
    ]
  }
}
```

**说明**：
- `budgetStatus`: 正常、接近超支、已超支
- `riskLevel`: 低、中、高
- 分析基于预算、当前支出、剩余天数等因素
- LLM 会提供个性化的消费建议

---

### 3.6 删除费用记录

**接口**: `DELETE /api/expenses/:id`

**请求头**:
```
Authorization: Bearer {token}
```

**URL 参数**:
- `id`: 费用记录ID (UUID)

**成功响应** (200):
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

## 4. 语音识别模块

### 4.1 语音识别

**接口**: `POST /api/voice/recognize`

**描述**: 使用科大讯飞 API 将音频转换为文字

**请求头**:
```
Content-Type: multipart/form-data
```

**请求体** (form-data):
- `audio`: File (音频文件，支持 WAV/MP3，建议采样率 16000Hz)

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "text": "我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子",
    "confidence": 0.95
  }
}
```

**失败响应** (400):
```json
{
  "success": false,
  "error": "No audio file provided"
}
```

**测试说明**:
1. 在 Apifox/Postman 中选择 Body 类型为 `form-data`
2. 添加字段 `audio`，类型选择 `File`
3. 上传一个音频文件（推荐 WAV 格式，16000Hz 采样率）
4. 发送请求

**应用场景**:
- 用户语音输入旅行需求
- 语音记录费用
- 语音添加行程备注

---

## 5. 地图服务模块

### 5.1 搜索地点

**接口**: `GET /api/map/search`

**请求头**: 无需认证

**Query 参数**:
- `keyword`: 搜索关键词 (必填)
- `city`: 城市名称 (可选)

**示例**: `GET /api/map/search?keyword=东京塔&city=东京`

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "pois": [
      {
        "name": "东京塔",
        "address": "东京都港区芝公园4-2-8",
        "location": {
          "lat": 35.6586,
          "lng": 139.7454
        },
        "type": "风景名胜",
        "tel": "03-3433-5111",
        "cityname": "东京都"
      }
    ]
  }
}
```

**其他测试用例**:
- `GET /api/map/search?keyword=浅草寺&city=东京`
- `GET /api/map/search?keyword=东京迪士尼乐园&city=东京`
- `GET /api/map/search?keyword=外滩&city=上海`
- `GET /api/map/search?keyword=成都大熊猫繁育研究基地&city=成都`

---

### 5.2 路线规划

**接口**: `GET /api/map/route`

**请求头**: 无需认证

**Query 参数**:
- `origin`: 起点坐标 "经度,纬度" (必填)
- `destination`: 终点坐标 "经度,纬度" (必填)
- `mode`: 出行方式 walking/transit/driving (可选，默认 transit)

**示例**: `GET /api/map/route?origin=139.7454,35.6586&destination=139.8107,35.7101&mode=transit`

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "route": {
      "distance": 5000,
      "duration": 1200,
      "steps": [...],
      "polyline": "..."
    }
  }
}
```

---

### 5.3 地址解析（地理编码）

**接口**: `GET /api/map/geocode`

**请求头**: 无需认证

**Query 参数**:
- `address`: 地址 (必填)
- `city`: 城市 (可选)

**示例**: `GET /api/map/geocode?address=东京塔&city=东京`

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "address": "东京都港区芝公园4-2-8",
    "location": {
      "lat": 35.6586,
      "lng": 139.7454
    },
    "province": "东京都",
    "city": "东京都",
    "district": "港区"
  }
}
```

---

## 6. 健康检查

### 6.1 健康检查

**接口**: `GET /health`

**请求头**: 无

**成功响应** (200):
```json
{
  "success": true,
  "message": "AI Travel Planner API is running",
  "timestamp": "2025-11-01T00:00:00.000Z"
}
```

---

## 测试流程建议

### 完整测试流程

**第一阶段：认证测试**

1. **健康检查**
   - 调用 `GET /health` 确认服务运行正常

2. **用户注册**
   - 调用 `POST /api/auth/register` 创建测试账号
   - 保存返回的 token

3. **用户登录**
   - 调用 `POST /api/auth/login` 测试登录
   - 验证 token 正确返回

4. **获取用户信息**
   - 调用 `GET /api/auth/profile` 验证认证功能

**第二阶段：行程规划测试**

5. **语音识别测试（可选）**
   - 调用 `POST /api/voice/recognize` 上传音频文件
   - 获取识别的文本

6. **提取旅行需求**
   - 调用 `POST /api/plans/extract` 提取结构化信息
   - 确认提取的信息是否正确

7. **生成旅行计划**
   - 调用 `POST /api/plans/generate` 生成详细计划
   - 保存返回的 planId

8. **查询计划列表**
   - 调用 `GET /api/plans` 验证计划已保存

9. **查询计划详情**
   - 调用 `GET /api/plans/:id` 查看完整行程

10. **更新计划**
    - 调用 `PUT /api/plans/:id` 修改计划信息

**第三阶段：费用管理测试**

11. **解析语音费用**
    - 调用 `POST /api/expenses/parse` 测试费用解析

12. **添加费用记录**
    - 调用 `POST /api/expenses` 添加多条费用
    - 测试不同类别（交通、住宿、餐饮、景点、其他）

13. **查询费用记录**
    - 调用 `GET /api/expenses/:planId` 查看费用列表

14. **查询费用统计**
    - 调用 `GET /api/expenses/:planId/summary` 查看汇总

15. **AI 费用分析**
    - 调用 `POST /api/expenses/:planId/analyze` 获取智能建议

**第四阶段：地图服务测试**

16. **地点搜索**
    - 调用 `GET /api/map/search` 搜索景点

17. **路线规划**
    - 调用 `GET /api/map/route` 规划两地路线

18. **地址解析**
    - 调用 `GET /api/map/geocode` 获取地理坐标

**第五阶段：删除操作测试**

19. **删除费用记录**
    - 调用 `DELETE /api/expenses/:id`

20. **删除旅行计划**
    - 调用 `DELETE /api/plans/:id`

### 快速测试用例

**最小测试流程**（验证核心功能）：

```
1. 注册/登录 → 获取 token
2. 提取需求 → "我想去成都3天，预算5000元，想吃火锅"
3. 生成计划 → 使用提取的结构化信息
4. 添加费用 → "午餐吃火锅花了200元"
5. 费用统计 → 查看预算使用情况
6. AI 分析 → 获取消费建议
```

---

## 类型标签规范

**系统统一使用中文类型标签**：

| 标签 | 说明                       | 示例                      |
| ---- | -------------------------- | ------------------------- |
| 交通 | 机票、火车、汽车、出租车等 | 上海→东京航班、地铁、打车 |
| 住宿 | 酒店、民宿等               | 希尔顿酒店、民宿          |
| 餐饮 | 早餐、午餐、晚餐、小吃等   | 一兰拉面、酒店早餐        |
| 景点 | 景点门票、导游服务等       | 东京塔门票、迪士尼门票    |
| 其他 | 购物、娱乐等其他支出       | 纪念品、游戏厅            |

**注意**：
- 所有 API 输入输出使用中文标签
- LLM 返回的 type/category 字段必须是中文
- 数据库存储使用中文
- 前端展示直接使用中文（无需转换）

---

## 错误码说明

| HTTP 状态码 | 说明                       | 示例场景                   |
| ----------- | -------------------------- | -------------------------- |
| 200         | 请求成功                   | 查询成功                   |
| 201         | 创建成功                   | 添加费用、生成计划         |
| 400         | 请求参数错误               | 缺少必填字段、类型错误     |
| 401         | 未授权（token 无效或过期） | 未登录、token 过期         |
| 403         | 禁止访问（无权限）         | 访问他人的计划             |
| 404         | 资源不存在                 | 计划不存在、费用记录不存在 |
| 500         | 服务器内部错误             | LLM 调用失败、数据库错误   |

---

## 在请求中使用变量

**Apifox/Postman 变量配置**：
- URL: `{{base_url}}/api/auth/login`
- Header: `Authorization: Bearer {{token}}`
- Body: `"planId": "{{plan_id}}"`

---

## 注意事项

### 接口调用说明

1. **认证 Token**: 
   - 除了健康检查、注册、登录、地图接口外，其他接口都需要 Bearer Token
   - Token 有效期为 7 天
   - 在请求头添加：`Authorization: Bearer {token}`

2. **UUID 格式**: 
   - 所有 ID 参数（planId, expenseId, userId）都是 UUID 格式
   - 示例：`550e8400-e29b-41d4-a716-446655440000`

3. **日期格式**: 
   - 统一使用 `YYYY-MM-DD` 格式
   - 示例：`2025-12-01`

4. **时间和时区**: ⚠️ **重要**
   - 后端返回的所有时间戳都是 **UTC 时间**（ISO 8601 格式）
   - 示例：`2025-11-04T08:30:00.000Z`（表示 UTC 时间 08:30）
   - **中国用户注意**：需要在前端加 8 小时转换为北京时间
   - 推荐使用 JavaScript 的 `new Date()` 或 `dayjs`/`moment.js` 等库自动处理
   - 前端转换示例：
     ```javascript
     // UTC 时间转本地时间
     const utcTime = "2025-11-04T08:30:00.000Z";
     const localTime = new Date(utcTime).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
     // 输出: "2025/11/4 16:30:00" (北京时间)
     ```

5. **金额**: 
   - 使用数字类型
   - 建议保留两位小数
   - 示例：`150.50`

6. **文件上传**: 
   - 语音识别接口使用 `multipart/form-data`
   - 字段名为 `audio`
   - 支持 WAV、MP3 格式

7. **LLM 响应时间**: 
   - 提取信息：2-5 秒
   - 生成行程：10-30 秒
   - 费用分析：3-8 秒
   - 建议设置 60 秒超时

### 数据约束

1. **类型标签**：必须使用中文（交通、住宿、餐饮、景点、其他）
2. **预算金额**：必须大于 0
3. **旅行天数**：结束日期必须晚于开始日期
4. **旅行人数**：必须至少为 1
