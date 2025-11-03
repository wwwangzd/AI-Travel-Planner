# AI 旅行规划师 API 测试文档

本文档提供完整的 API 接口测试用例，可直接在 Apifox 中使用。

## 基础信息

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)

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

### 2.1 生成旅行计划

**接口**: `POST /api/plans/generate`

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
    "withKids": true,
    "accommodation": "舒适型"
  }
}
```

**成功响应** (201):
```json
{
  "success": true,
  "data": {
    "planId": "uuid",
    "title": "日本5日游",
    "overview": "这是一次精心规划的日本之旅...",
    "itinerary": [
      {
        "day": 1,
        "date": "2025-12-01",
        "theme": "东京初体验",
        "items": [
          {
            "type": "transportation",
            "time": "08:00",
            "title": "上海浦东机场 → 东京成田机场",
            "description": "建议预订国航CA929航班",
            "location": "东京成田机场",
            "estimatedCost": 2000,
            "tips": "提前2小时到达机场办理登机"
          },
          {
            "type": "accommodation",
            "time": "14:00",
            "title": "入住东京湾希尔顿酒店",
            "description": "位于台场，交通便利",
            "location": "东京台场",
            "estimatedCost": 800,
            "tips": "可以提前在官网预订享受折扣"
          },
          {
            "type": "attraction",
            "time": "16:00",
            "title": "台场海滨公园",
            "description": "欣赏东京湾美景，游览自由女神像",
            "location": "东京台场",
            "estimatedCost": 0,
            "tips": "傍晚时分景色最美"
          },
          {
            "type": "restaurant",
            "time": "18:30",
            "title": "一兰拉面（台场店）",
            "description": "品尝正宗日式拉面",
            "location": "东京台场",
            "estimatedCost": 100,
            "tips": "高峰期可能需要排队"
          }
        ]
      }
    ],
    "budgetBreakdown": {
      "transportation": 4000,
      "accommodation": 3000,
      "food": 2000,
      "activities": 800,
      "reserve": 200
    },
    "tips": [
      "日本冬季气温较低，建议携带保暖衣物",
      "提前购买西瓜卡或Pasmo卡，方便乘坐公共交通",
      "部分餐厅不接受信用卡，建议准备现金"
    ]
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

### 2.2 获取所有旅行计划

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

### 2.3 获取单个旅行计划详情

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

### 2.4 更新旅行计划

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

### 2.5 删除旅行计划

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

### 3.1 添加费用记录

**接口**: `POST /api/expenses`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "planId": "uuid",
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
    "expense": {
      "id": "uuid",
      "plan_id": "uuid",
      "category": "餐饮",
      "amount": 150.50,
      "currency": "CNY",
      "description": "午餐 - 一兰拉面",
      "expense_date": "2025-12-01",
      "created_by": "uuid",
      "created_at": "2025-11-01T00:00:00.000Z"
    }
  }
}
```

---

### 3.2 获取费用记录列表

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

### 3.3 获取费用统计汇总

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
    "breakdown": {
      "餐饮": 1500,
      "交通": 2000,
      "住宿": 2000,
      "购物": 178.90
    }
  }
}
```

---

### 3.4 删除费用记录

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

**请求头**:
```
Authorization: Bearer {token}  (可选，如果需要认证)
Content-Type: multipart/form-data
```

**请求体** (form-data):
- `audio`: File (音频文件，支持 WAV/MP3)

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
1. 在 Apifox 中选择 Body 类型为 form-data
2. 添加字段 `audio`，类型选择 File
3. 上传一个音频文件进行测试

---

### 4.2 解析费用语音

**接口**: `POST /api/voice/parse-expense`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "text": "午餐花了150元"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "category": "餐饮",
    "amount": 150,
    "description": "午餐"
  }
}
```

**其他测试用例**:

测试用例 1:
```json
{
  "text": "打车去机场花了200块钱"
}
```
预期响应:
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

测试用例 2:
```json
{
  "text": "在东京塔买了纪念品500日元"
}
```
预期响应:
```json
{
  "success": true,
  "data": {
    "category": "购物",
    "amount": 500,
    "description": "在东京塔买了纪念品"
  }
}
```

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
- `GET /api/map/search?keyword=迪士尼乐园&city=东京`
- `GET /api/map/search?keyword=外滩&city=上海`

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

### 完整测试流程：

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

5. **生成旅行计划**
   - 调用 `POST /api/plans/generate`
   - 保存返回的 planId

6. **查询计划列表**
   - 调用 `GET /api/plans` 验证计划已保存

7. **查询计划详情**
   - 调用 `GET /api/plans/:id` 查看完整行程

8. **添加费用记录**
   - 调用 `POST /api/expenses` 添加几条费用

9. **查询费用记录**
   - 调用 `GET /api/expenses/:planId` 查看费用列表

10. **查询费用统计**
    - 调用 `GET /api/expenses/:planId/summary` 查看汇总

11. **地图功能测试**
    - 测试 POI 搜索
    - 测试路线规划
    - 测试地址解析

12. **语音功能测试**
    - 上传音频文件测试语音识别
    - 测试费用解析

13. **更新和删除**
    - 更新计划
    - 删除费用记录
    - 删除计划

---

## 错误码说明

| HTTP 状态码 | 说明                       |
| ----------- | -------------------------- |
| 200         | 请求成功                   |
| 201         | 创建成功                   |
| 400         | 请求参数错误               |
| 401         | 未授权（token 无效或过期） |
| 403         | 禁止访问（无权限）         |
| 404         | 资源不存在                 |
| 500         | 服务器内部错误             |

---

## Apifox 环境变量配置

建议在 Apifox 中配置以下环境变量：

```
base_url = http://localhost:3000
token = (登录后自动设置)
plan_id = (生成计划后自动设置)
```

在请求中使用变量：
- URL: `{{base_url}}/api/auth/login`
- Header: `Authorization: Bearer {{token}}`

---

## 注意事项

1. **认证 Token**: 大部分接口需要在请求头中携带 Bearer Token
2. **UUID 格式**: 所有 ID 参数都是 UUID 格式
3. **日期格式**: 统一使用 YYYY-MM-DD 格式
4. **金额**: 使用数字类型，保留两位小数
5. **文件上传**: 语音识别接口使用 multipart/form-data
6. **LLM 响应**: 生成行程可能需要 10-30 秒，请耐心等待

---

## 常见问题

**Q: Token 过期怎么办？**
A: 重新调用登录接口获取新的 token

**Q: 生成计划时间太长？**
A: LLM API 调用需要时间，建议设置 60 秒超时

**Q: 语音识别失败？**
A: 检查音频格式是否正确，确保科大讯飞 API 配置正确

**Q: 地图搜索无结果？**
A: 检查高德地图 API Key 是否配置正确，确保搜索关键词准确
