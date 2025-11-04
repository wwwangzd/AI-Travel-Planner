# AI Travel Planner Backend

AI 旅行规划师后端 API 服务

## 项目概述

本项目是一个基于 AI 的旅行规划后端服务，支持智能行程规划、费用管理、语音交互等功能。

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js + TypeScript
- **数据库**: Supabase (PostgreSQL)
- **认证**: 自定义 JWT + bcrypt
- **外部服务**:
  - LLM: 阿里云通义千问 (qwen-plus)
  - 语音识别: 科大讯飞语音听写 API
  - 地图: 高德地图 Web API

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

创建 `.env` 文件并配置以下环境变量：

```bash
# 服务器配置
PORT=3000
NODE_ENV=development

# Supabase 数据库
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# JWT 认证
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# 科大讯飞语音识别
XF_APP_ID=your-app-id
XF_API_KEY=your-api-key
XF_API_SECRET=your-api-secret

# 高德地图
AMAP_KEY=your-amap-key

# LLM API（通义千问）
LLM_API_KEY=sk-your-api-key
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL=qwen-plus
```

### 3. 外部服务配置

#### 3.1 Supabase（数据库）

1. 访问 https://supabase.com 注册并创建项目
2. 在项目设置的 API 页面获取：
   - `SUPABASE_URL`：项目 URL
   - `SUPABASE_SERVICE_ROLE_KEY`：service_role key
3. 在 SQL Editor 中执行 `src/database/schema.sql` 初始化数据库表

#### 3.2 JWT 密钥

生成 JWT 密钥（使用以下任一方法）：

```bash
# 方法 1: 使用 OpenSSL
openssl rand -base64 64

# 方法 2: 使用 Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

#### 3.3 阿里云通义千问

1. 访问 https://dashscope.aliyun.com
2. 登录阿里云账号并开通 DashScope 服务
3. 在控制台的 API-KEY 管理页面创建并复制 API Key

#### 3.4 高德地图

1. 访问 https://lbs.amap.com 注册并登录
2. 在控制台创建应用并添加 Web 服务类型的 Key
3. 复制生成的 Key

#### 3.5 科大讯飞

1. 访问 https://www.xfyun.cn 注册并登录
2. 创建"语音听写（流式版）"应用
3. 在应用详情中获取 APPID、APIKey 和 APISecret

### 4. 初始化数据库

在 Supabase 控制台的 SQL Editor 中执行 `src/database/schema.sql` 文件内容。

### 5. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

### 6. 验证服务

```bash
curl http://localhost:3000/health
```

预期返回：
```json
{
  "success": true,
  "message": "AI Travel Planner API is running",
  "timestamp": "2025-11-04T..."
}
```

## 生产部署

### 本地构建

```bash
npm run build
npm start
```

### Docker 部署

在项目根目录执行：

```bash
# 构建并启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f backend

# 停止服务
docker-compose down
```

## API 接口

详细的 API 文档请查看 `../API测试文档.md`

### 主要接口模块

- **认证模块** (`/api/auth`)
  - 用户注册、登录
  - 获取用户信息

- **行程规划模块** (`/api/plans`)
  - 从自然语言提取旅行需求
  - 生成个性化旅行计划
  - 管理旅行计划（查询、更新、删除）

- **费用管理模块** (`/api/expenses`)
  - 添加费用记录
  - 查询费用统计
  - AI 费用分析

- **语音识别模块** (`/api/voice`)
  - 语音识别
  - 语音费用解析

- **地图服务模块** (`/api/map`)
  - 地点搜索
  - 路线规划
  - 地理编码

## 项目结构

```
backend/
├── src/
│   ├── controllers/          # 业务控制器
│   │   ├── authController.ts       # 用户认证
│   │   ├── planController.ts       # 行程规划
│   │   ├── expenseController.ts    # 费用管理
│   │   ├── voiceController.ts      # 语音识别
│   │   └── mapController.ts        # 地图服务
│   ├── services/             # 外部服务
│   │   ├── llmService.ts           # LLM 服务
│   │   ├── voiceService.ts         # 语音服务
│   │   └── mapService.ts           # 地图服务
│   ├── middleware/           # 中间件
│   │   ├── auth.ts                 # JWT 认证
│   │   └── errorHandler.ts         # 错误处理
│   ├── routes/               # 路由
│   │   ├── auth.ts
│   │   ├── plans.ts
│   │   ├── expenses.ts
│   │   ├── voice.ts
│   │   └── map.ts
│   ├── database/             # 数据库
│   │   ├── supabase.ts             # Supabase 客户端
│   │   └── schema.sql              # 数据库表结构
│   ├── types/                # 类型定义
│   │   └── models.ts
│   └── index.ts              # 应用入口
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## 核心功能

### 1. 智能行程规划

- **两步式交互流程**：
  1. 从用户自然语言输入中提取结构化信息
  2. 基于确认后的信息生成详细行程计划
  
- **支持的输入方式**：
  - 文字输入
  - 语音输入（通过科大讯飞）

- **生成内容**：
  - 每日详细行程（交通、住宿、景点、餐饮）
  - 预算分配建议
  - 地理位置信息

### 2. 费用管理

- 支持语音和文字添加费用记录
- 实时统计和分类展示
- AI 费用分析：
  - 预算对比
  - 消费趋势分析
  - 节省建议
  - 超支预警

### 3. 类型标签规范

系统统一使用中文类型标签：

- **交通**：机票、火车、出租车、公交等
- **住宿**：酒店、民宿等
- **餐饮**：早餐、午餐、晚餐、小吃等
- **景点**：门票、导游等
- **其他**：购物、娱乐等其他支出

所有 API 输入输出、数据库存储、LLM 返回均使用中文标签。

## 安全注意事项

⚠️ **重要**：

- 使用 `SUPABASE_SERVICE_ROLE_KEY`（而非 SUPABASE_ANON_KEY）
- `JWT_SECRET` 必须是强随机字符串（至少 64 字节）
- **绝对不要**将 `.env` 文件提交到 Git
- **绝对不要**将 API Key 硬编码到代码中
- service_role key 只能在后端使用，不要暴露给前端

## 常见问题

### Q: 为什么使用 service_role key 而不是 anon key？

A: 本项目使用自定义 JWT 认证而非 Supabase Auth，需要使用 service_role key 绕过 Row Level Security (RLS)。权限控制在应用层实现。

### Q: LLM 响应时间较长怎么办？

A: 正常情况下生成行程需要 10-30 秒。建议在前端添加加载动画，并设置合理的超时时间（60 秒）。

### Q: 如何测试 API？

A: 推荐使用 Apifox、Postman 等工具，参考 `API测试文档.md` 中的测试用例。

## 许可证

MIT
