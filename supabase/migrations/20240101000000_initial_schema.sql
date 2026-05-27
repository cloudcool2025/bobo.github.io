-- 用户资料表
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 对局表
CREATE TABLE matches (
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

-- 索引
CREATE INDEX idx_matches_initiator ON matches(initiator_id);
CREATE INDEX idx_matches_opponent ON matches(opponent_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

-- RLS 策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- user_profiles 策略
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- matches 策略
CREATE POLICY "Users can view all matches" ON matches
    FOR SELECT USING (true);

CREATE POLICY "Users can create matches" ON matches
    FOR INSERT WITH CHECK (auth.uid() = initiator_id OR auth.uid() = opponent_id);

CREATE POLICY "Players can update own matches" ON matches
    FOR UPDATE USING (
        auth.uid() = initiator_id OR 
        auth.uid() = opponent_id OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete matches" ON matches
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 触发器：自动创建用户资料
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, username)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 触发器：更新 updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_profiles_updated
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 存储桶：头像
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 存储策略
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- 授权
GRANT ALL PRIVILEGES ON TABLE user_profiles TO authenticated;
GRANT ALL PRIVILEGES ON TABLE matches TO authenticated;
GRANT SELECT ON TABLE user_profiles TO anon;
GRANT SELECT ON TABLE matches TO anon;
