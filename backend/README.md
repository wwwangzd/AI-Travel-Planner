# AI Travel Planner Backend

AI 旅行规划师后端 API 服务

## 项目概述

本项目是一个基于 AI 的智能旅行规划后端服务，支持：
- 🎤 智能语音输入和自然语言理解
- 🗺️ AI 驱动的个性化行程规划
- 💰 智能费用预算管理和分析
- 👤 用户偏好学习和自动应用
- 📍 地图服务集成（地点搜索、路线规划）

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js + TypeScript
- **数据库**: Supabase (PostgreSQL)
- **认证**: 自定义 JWT + bcrypt
- **外部服务**:
  - LLM: 阿里云通义千问 (qwen-flash)
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
LLM_MODEL=qwen-flash
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

在 Supabase 控制台的 SQL Editor 中依次执行：

1. **基础表结构**：执行 `src/database/schema.sql` 文件内容
2. **偏好表迁移**（如果已有旧版本）：执行 `src/database/migration_update_preferences.sql` 文件内容

如果是全新项目，只需执行 `schema.sql` 即可。

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

详细的 API 接口设计和说明请查看项目根目录下的 `设计文档.md`

### 主要接口模块

- **认证模块** (`/api/auth`)
  - `POST /register` - 用户注册
  - `POST /login` - 用户登录
  - `GET /profile` - 获取用户信息

- **用户偏好模块** (`/api/preferences`)
  - `GET /` - 获取用户偏好
  - `PUT /` - 更新用户偏好
  - `POST /learn` - 从历史计划学习偏好

- **行程规划模块** (`/api/plans`)
  - `POST /extract` - 从自然语言提取旅行需求
  - `POST /generate` - 生成个性化旅行计划
  - `GET /` - 获取所有旅行计划
  - `GET /:id` - 获取单个计划详情
  - `DELETE /:id` - 删除旅行计划

- **费用管理模块** (`/api/expenses`)
  - `POST /parse` - 从自然语言解析费用信息
  - `POST /` - 添加费用记录
  - `GET /:planId` - 获取费用记录列表
  - `GET /:planId/summary` - 获取费用统计汇总
  - `POST /:planId/analyze` - AI 费用分析
  - `DELETE /:id` - 删除费用记录

- **语音识别模块** (`/api/voice`)
  - `POST /recognize` - 语音识别

- **地图服务模块** (`/api/map`)
  - `GET /search` - 地点搜索
  - `GET /route` - 路线规划
  - `GET /geocode` - 地理编码

## 项目结构

```
backend/
├── src/
│   ├── controllers/          # 业务控制器
│   │   ├── authController.ts         # 用户认证
│   │   ├── planController.ts         # 行程规划
│   │   ├── expenseController.ts      # 费用管理
│   │   ├── preferenceController.ts   # 用户偏好
│   │   ├── voiceController.ts        # 语音识别
│   │   └── mapController.ts          # 地图服务
│   ├── services/             # 外部服务
│   │   ├── llmService.ts             # LLM 服务
│   │   ├── voiceService.ts           # 语音服务
│   │   └── mapService.ts             # 地图服务
│   ├── middleware/           # 中间件
│   │   ├── auth.ts                   # JWT 认证
│   │   └── errorHandler.ts           # 错误处理
│   ├── routes/               # 路由
│   │   ├── auth.ts                   # 认证路由
│   │   ├── plans.ts                  # 行程路由
│   │   ├── expenses.ts               # 费用路由
│   │   ├── preferences.ts            # 偏好路由
│   │   ├── voice.ts                  # 语音路由
│   │   └── map.ts                    # 地图路由
│   ├── database/             # 数据库
│   │   ├── supabase.ts                       # Supabase 客户端
│   │   ├── schema.sql                        # 数据库表结构
│   │   ├── migration_update_preferences.sql  # 偏好表迁移
│   │   └── migration_add_fields.sql          # 字段迁移
│   ├── types/                # 类型定义
│   │   └── models.ts                 # 数据模型类型
│   └── index.ts              # 应用入口
├── .dockerignore             # Docker 忽略文件
├── .env                      # 环境变量（需挂载到容器）
├── .gitignore                # Git 忽略文件
├── Dockerfile                # Docker 镜像构建配置
├── package.json              # 依赖配置
├── package-lock.json         # 依赖锁定文件
├── tsconfig.json             # TypeScript 配置
└── README.md                 # 项目文档
```

## 许可证

MIT
