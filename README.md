# AI-Travel-Planner
软件旨在简化旅行规划过程，通过 AI 了解用户需求，自动生成详细的旅行路线和建议，并提供实时旅行辅助。

## 快速开始

### 使用 Docker 镜像运行

1. **加载镜像文件**
```bash
# 加载后端镜像
docker load -i ai-travel-planner-backend.tar

# 加载前端镜像
docker load -i ai-travel-planner-frontend.tar

# 查看已加载的镜像
docker images | grep ai-travel-planner
```

2. **配置环境变量**
```bash
# 创建 backend.env 文件，填入以下配置：
# SUPABASE_URL=你的supabase地址
# SUPABASE_SERVICE_ROLE_KEY=你的supabase密钥
# JWT_SECRET=你的jwt密钥
# LLM_API_KEY=你的通义千问API密钥
# AMAP_KEY=你的高德地图密钥
# XF_APP_ID=你的讯飞语音APP_ID
# XF_API_KEY=你的讯飞语音API_KEY
# XF_API_SECRET=你的讯飞语音API_SECRET
```

3. **运行容器**
```bash
# 创建 Docker 网络
docker network create travel-network

# 运行后端（在项目根目录执行）
docker run -d \
  --name travel-backend \
  --network travel-network \
  --network-alias backend \
  -p 3000:3000 \
  -v "$(pwd)/backend.env:/app/.env:ro" \
  ai-travel-planner-backend:latest

# 运行前端
docker run -d \
  --name travel-frontend \
  --network travel-network \
  -p 80:80 \
  ai-travel-planner-frontend:latest
```

4. **访问应用**
- 前端: http://localhost
- 后端 API: http://localhost:3000

5. **停止和清理**
```bash
# 停止容器
docker stop travel-backend travel-frontend

# 删除容器
docker rm travel-backend travel-frontend

# 删除网络（可选）
docker network rm travel-network
```

### 本地开发运行

详细的本地开发配置请参考：
- [后端 README](./backend/README.md)
- [前端 README](./frontend/README.md)

## 项目结构

```
AI-Travel-Planner/
├── backend/                        # 后端服务
├── frontend/                       # 前端应用
├── ai-travel-planner-backend.tar   # 后端 Docker 镜像
├── ai-travel-planner-frontend.tar  # 前端 Docker 镜像
├── backend.env                     # 后端环境变量（需自行创建）
└── README.md                       # 项目说明
```
