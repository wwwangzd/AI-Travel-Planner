-- ============================================
-- 数据库迁移脚本
-- 添加 budget_breakdown 和 day_theme 字段
-- 执行日期: 2025-11-04
-- ============================================

-- 1. 为 travel_plans 表添加 budget_breakdown 字段
ALTER TABLE travel_plans 
ADD COLUMN IF NOT EXISTS budget_breakdown JSONB;

-- 2. 为 itinerary_items 表添加 day_theme 字段
ALTER TABLE itinerary_items 
ADD COLUMN IF NOT EXISTS day_theme VARCHAR(255);

-- 验证字段是否添加成功
-- 查看 travel_plans 表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'travel_plans' 
  AND column_name = 'budget_breakdown';

-- 查看 itinerary_items 表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'itinerary_items' 
  AND column_name = 'day_theme';
