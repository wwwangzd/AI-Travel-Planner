-- ============================================
-- 更新用户偏好表结构
-- ============================================
-- 将原来的 key-value 结构改为直接存储 interests 和 special_needs 数组
-- ============================================

-- 删除旧的用户偏好表
DROP TABLE IF EXISTS user_preferences CASCADE;

-- 创建新的用户偏好表
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  interests TEXT[] DEFAULT '{}',
  special_needs TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 禁用 RLS（因为我们使用应用层认证）
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 创建更新时间触发器
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 说明：
-- interests: 用户的兴趣偏好数组，如 ['美食', '动漫', '历史文化']
-- special_needs: 用户的特殊需求数组，如 ['带孩子', '带老人', '无障碍需求']
