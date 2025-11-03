import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import planRoutes from './routes/plans';
import expenseRoutes from './routes/expenses';
import mapRoutes from './routes/map';
import voiceRoutes from './routes/voice';
import { errorHandler } from './middleware/errorHandler';

// 加载环境变量
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'AI Travel Planner API is running',
        timestamp: new Date().toISOString()
    });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/voice', voiceRoutes);

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
