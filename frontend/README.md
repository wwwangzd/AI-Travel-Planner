# AI 旅行规划师 - 前端

基于 React + TypeScript + Vite 构建的现代化 Web 应用前端，提供智能旅行规划、费用管理、地图展示等功能。

## 功能特性

### 1. 智能行程规划
- 🎤 **语音输入**: 支持语音描述旅行需求
- 📝 **文字输入**: 自然语言描述旅行计划
- 🤖 **AI 提取**: 自动提取目的地、日期、预算等信息
- ✅ **信息确认**: 用户可确认和修改提取的信息
- 🚀 **自动生成**: AI 生成详细的日程安排

### 2. 地图展示
- 🗺️ **高德地图集成**: 清晰展示旅行路线
- 📍 **位置标记**: 标记景点、酒店、餐厅等位置
- 🎨 **分类着色**: 不同类型的地点使用不同颜色
- 📱 **交互体验**: 点击标记查看详细信息

### 3. 费用管理
- 💰 **费用记录**: 支持语音和文字记录费用
- 📊 **统计分析**: 实时查看总支出和预算使用情况
- 🤖 **AI 分析**: 智能分析消费趋势，提供节省建议
- ⚠️ **超支预警**: 预算接近或超支时自动提醒

### 4. 用户体验
- 🎨 **现代化 UI**: 使用 Ant Design 组件库
- 📱 **响应式设计**: 支持手机、平板、电脑等设备
- ✨ **流畅动画**: 页面切换和交互动画效果
- 🌈 **渐变主题**: 紫色渐变主题色，美观大方

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

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 安装和运行

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

## API 接口

前端通过 Axios 与后端 API 通信，主要接口包括：

- **认证**: `/api/auth/*`
- **计划**: `/api/plans/*`
- **费用**: `/api/expenses/*`
- **偏好**: `/api/preferences/*`
- **语音**: `/api/voice/*`
- **地图**: `/api/map/*`

详见后端 API 文档。

## 高德地图集成

### 申请 API Key

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册并创建应用
3. 获取 Web 端（JS API）Key
4. 如需要，配置安全密钥

### 配置

在 `.env` 文件中配置：

```env
VITE_AMAP_KEY=your_key_here
VITE_AMAP_SECURITY_CODE=your_security_code_here
```

## 开发指南

### 添加新页面

1. 在 `src/pages/` 创建组件
2. 在 `src/App.tsx` 添加路由
3. 如需要，添加到侧边栏菜单

### 添加新 API

1. 在 `src/api/` 创建对应模块
2. 在 `src/types/index.ts` 添加类型定义
3. 使用 `request` 封装发起请求

### 状态管理

使用 Zustand 进行状态管理：

```typescript
import { create } from 'zustand';

interface MyState {
  data: any;
  setData: (data: any) => void;
}

export const useMyStore = create<MyState>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
```

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 注意事项

1. **API Key 安全**: 不要将真实的 API Key 提交到 Git
2. **环境变量**: 使用 `.env` 文件管理配置
3. **语音权限**: 语音功能需要浏览器麦克风权限
4. **HTTPS**: 生产环境建议使用 HTTPS
5. **跨域**: 开发环境已配置代理，生产环境需要配置 CORS

## License

MIT
