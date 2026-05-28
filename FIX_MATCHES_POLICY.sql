-- 修复 matches 表的 RLS 策略
-- 问题：原来的策略不允许用户创建对局，因为插入时 opponent_id 还不存在

-- 删除原有的创建策略
DROP POLICY IF EXISTS "Users can create matches" ON matches;

-- 创建新的策略：允许所有已认证用户创建对局
CREATE POLICY "Users can create matches" ON matches
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 验证策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'matches';
