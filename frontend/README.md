# AI 旅行规划师 - 前端

基于 React + TypeScript + Vite 构建的现代化 Web 应用前端，提供智能旅行规划、费用管理、地图展示等功能。

## 主要功能模块

### 1. 认证模块 (Auth)

- 用户注册和登录
- JWT Token 管理
- 自动登录（Token 持久化）
- 路由守卫（未登录跳转）

### 2. 行程规划模块 (Plan)

**创建计划流程：**

1. 用户输入旅行需求（语音或文字）
2. AI 提取结构化信息
3. 用户确认和修改信息
4. AI 生成详细行程
5. 保存并展示计划

**计划详情页：**

- 地图展示所有景点位置
- 按天展示详细行程
- 费用统计和管理
- 偏好信息展示

### 3. 费用管理模块 (Expense)

- 手动添加费用记录
- 语音快速记录费用
- 费用列表和分类统计
- 预算使用进度条
- AI 费用分析和建议

### 4. 偏好管理模块 (Preference)

- 设置兴趣偏好
- 设置特殊需求
- 从历史计划学习偏好
- 创建计划时自动应用

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 7
- **UI 组件**: Ant Design 5
- **状态管理**: Zustand
- **路由**: React Router 6
- **HTTP 客户端**: Axios
- **地图**: 高德地图 Web SDK
- **日期处理**: Day.js
- **样式**: CSS Modules + 全局样式

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件，并填写配置：

```env
# API 后端地址
VITE_API_BASE_URL=http://localhost:3000

# 高德地图配置（在 https://lbs.amap.com/ 获取）
VITE_AMAP_KEY=your_amap_key_here
VITE_AMAP_SECURITY_CODE=your_amap_security_code_here
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 4. 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录。

### 5. 预览生产版本

```bash
npm run preview
```

## 项目结构

```
frontend/
├── public/                # 静态资源
├── src/
│   ├── api/              # API 请求模块
│   │   ├── auth.ts       # 认证相关
│   │   ├── plan.ts       # 计划相关
│   │   ├── expense.ts    # 费用相关
│   │   ├── preference.ts # 偏好相关
│   │   ├── voice.ts      # 语音相关
│   │   └── map.ts        # 地图相关
│   ├── components/       # 通用组件
│   │   ├── MainLayout.tsx       # 主布局
│   │   ├── PrivateRoute.tsx     # 路由守卫
│   │   ├── TravelMap.tsx        # 地图组件
│   │   ├── VoiceRecorder.tsx    # 语音录制
│   │   └── ExpenseManager.tsx   # 费用管理
│   ├── pages/            # 页面组件
│   │   ├── Auth.tsx      # 登录/注册
│   │   ├── Home.tsx      # 首页
│   │   ├── CreatePlan.tsx      # 创建计划
│   │   ├── PlanList.tsx        # 计划列表
│   │   ├── PlanDetail.tsx      # 计划详情
│   │   └── Preferences.tsx     # 偏好设置
│   ├── store/            # 状态管理
│   │   ├── authStore.ts  # 认证状态
│   │   └── planStore.ts  # 计划状态
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/            # 工具函数
│   │   └── request.ts    # Axios 封装
│   ├── App.tsx           # 根组件
│   ├── App.css           # 全局样式
│   ├── main.tsx          # 入口文件
│   └── index.css         # 基础样式
├── .env                  # 环境变量（不提交到 Git）
├── index.html            # HTML 模板
├── package.json          # 依赖配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
└── README.md             # 项目文档
```

## 许可证

MIT
