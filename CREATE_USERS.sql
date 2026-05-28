-- 创建4个台球计分小程序用户
-- 用户名: zhaobo, sunzhigang, chenzhuang, niedi
-- 密码: 123

-- 创建用户函数
CREATE OR REPLACE FUNCTION create_billiards_user(p_username TEXT, p_email TEXT, p_password TEXT)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- 创建认证用户
    SELECT id INTO user_id FROM auth.admin.create_user(
        ARRAY[
            'email', p_email,
            'password', p_password,
            'raw_user_meta_data', jsonb_build_object('username', p_username)
        ]
    );
    
    -- 创建用户资料
    INSERT INTO public.user_profiles (id, username)
    VALUES (user_id, p_username)
    ON CONFLICT (id) DO UPDATE SET username = p_username;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建4个用户
SELECT create_billiards_user('zhaobo', 'zhaobo@example.com', '123');
SELECT create_billiards_user('sunzhigang', 'sunzhigang@example.com', '123');
SELECT create_billiards_user('chenzhuang', 'chenzhuang@example.com', '123');
SELECT create_billiards_user('niedi', 'niedi@example.com', '123');

-- 查看创建的用户
SELECT id, username, email FROM auth.users 
JOIN user_profiles ON auth.users.id = user_profiles.id;

-- 删除临时函数
DROP FUNCTION IF EXISTS create_billiards_user(TEXT, TEXT, TEXT);
