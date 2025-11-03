import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { supabase } from '../database/supabase';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().optional()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { email, password, username } = registerSchema.parse(req.body);

            // 检查用户是否已存在
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Email already registered'
                });
            }

            // 加密密码
            const password_hash = await bcrypt.hash(password, 10);

            // 创建用户
            const { data: user, error } = await supabase
                .from('users')
                .insert({
                    email,
                    password_hash,
                    username: username || email.split('@')[0]
                })
                .select('id, email, username, created_at')
                .single();

            if (error) {
                throw error;
            }

            // 生成 JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET!,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username
                    },
                    token
                }
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors
                });
            }
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to register'
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = loginSchema.parse(req.body);

            // 查找用户
            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, username, password_hash')
                .eq('email', email)
                .single();

            if (error || !user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            // 验证密码
            const isValidPassword = await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            // 生成 JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET!,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username
                    },
                    token
                }
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors
                });
            }
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to login'
            });
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;

            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, username, avatar_url, created_at')
                .eq('id', userId)
                .single();

            if (error || !user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                data: { user }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get profile'
            });
        }
    }
}

export const authController = new AuthController();
