# AI Travel Planner Backend

AI 旅行规划师后端 API 服务

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js + TypeScript
- **数据库**: Supabase (PostgreSQL)
- **认证**: 自定义 JWT + bcrypt
- **外部服务**:
  - LLM: 阿里云通义千问
  - 语音识别: 科大讯飞
  - 地图: 高德地图

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制并编辑环境变量文件：

```bash
cp .env.example .env
```

**必须配置的环境变量**：

1. **Supabase**（数据库）
   - `SUPABASE_URL`: 你的 Supabase 项目 URL
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role key（不是 anon key）

2. **JWT**（认证密钥）
   - `JWT_SECRET`: 生成随机字符串
   ```bash
   openssl rand -base64 64
   ```

3. **通义千问**（LLM）
   - `LLM_API_KEY`: 阿里云 DashScope API Key
   - `LLM_BASE_URL`: https://dashscope.aliyuncs.com/compatible-mode/v1
   - `LLM_MODEL`: qwen-plus

4. **高德地图**
   - `AMAP_KEY`: 高德地图 Web 服务 API Key

5. **科大讯飞**（语音识别）
   - `XF_APP_ID`: 应用 ID
   - `XF_API_KEY`: API Key
   - `XF_API_SECRET`: API Secret

详细配置说明请查看 `../后端部署指南.md`

### 3. 初始化数据库

在 Supabase 控制台的 SQL Editor 中执行 `src/database/schema.sql` 文件的内容。

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

### 5. 验证服务

```bash
curl http://localhost:3000/health
```

## 生产部署

### 构建

```bash
npm run build
npm start
```

### Docker 部署

```bash
# 在项目根目录
docker-compose up -d
```

## API 文档

请查看 `../API测试文档.md` 了解详细的接口说明和测试用例。

## 项目结构

```
backend/
├── src/
│   ├── controllers/      # 业务控制器
│   ├── services/         # 外部服务
│   ├── middleware/       # 中间件
│   ├── routes/          # 路由
│   ├── database/        # 数据库
│   ├── types/           # 类型定义
│   └── index.ts         # 入口文件
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env.example
```

## 安全注意事项

⚠️ **重要**：
- 使用 `SUPABASE_SERVICE_ROLE_KEY` 而非 `SUPABASE_ANON_KEY`
- `JWT_SECRET` 必须是强随机字符串
- 绝对不要将 `.env` 文件提交到 Git
- service_role key 只能在后端使用，不要暴露给前端

## 许可证

MIT
