-- ============================================
-- 台球计分小程序 - 数据库迁移脚本（仅核心部分）
-- ============================================

-- 检查并创建matches表（如果不存在）
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    opponent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    initiator_score INTEGER DEFAULT 0,
    opponent_score INTEGER DEFAULT 0,
    initiator_fouls INTEGER DEFAULT 0,
    opponent_fouls INTEGER DEFAULT 0,
    initiator_lucky INTEGER DEFAULT 0,
    opponent_lucky INTEGER DEFAULT 0,
    winner_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'playing', 'finished')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    CONSTRAINT different_players CHECK (initiator_id != opponent_id)
);

-- 为matches表创建索引
CREATE INDEX IF NOT EXISTS idx_matches_initiator ON matches(initiator_id);
CREATE INDEX IF NOT EXISTS idx_matches_opponent ON matches(opponent_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- 为matches表启用RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 为matches表创建RLS策略
DROP POLICY IF EXISTS "Users can view all matches" ON matches;
CREATE POLICY "Users can view all matches" ON matches
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create matches" ON matches;
CREATE POLICY "Users can create matches" ON matches
    FOR INSERT WITH CHECK (auth.uid() = initiator_id OR auth.uid() = opponent_id);

DROP POLICY IF EXISTS "Players can update own matches" ON matches;
CREATE POLICY "Players can update own matches" ON matches
    FOR UPDATE USING (
        auth.uid() = initiator_id OR 
        auth.uid() = opponent_id OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete matches" ON matches;
CREATE POLICY "Admins can delete matches" ON matches
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 为matches表授权
GRANT ALL PRIVILEGES ON TABLE matches TO authenticated;
GRANT SELECT ON TABLE matches TO anon;
