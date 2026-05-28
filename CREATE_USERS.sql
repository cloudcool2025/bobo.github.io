-- 创建4个台球计分小程序用户
-- 用户名: zhaobo, sunzhigang, chenzhuang, niedi
-- 密码: 123456 (6个字符)

-- 创建用户函数（修复类型不匹配问题）
CREATE OR REPLACE FUNCTION public.create_user_no_email(p_username TEXT, p_email TEXT, p_password TEXT)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
    meta_data TEXT := '{\"username\": \"' || p_username || '\"}';
BEGIN
    SELECT id INTO user_id FROM auth.admin.create_user(
        ARRAY[
            'email', p_email,
            'password', p_password,
            'raw_user_meta_data', meta_data,
            'email_confirm', 'true'
        ]::TEXT[]
    );
    
    INSERT INTO public.user_profiles (id, username)
    VALUES (user_id, p_username)
    ON CONFLICT (id) DO UPDATE SET username = p_username;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建剩余用户
SELECT create_user_no_email('sunzhigang', 'sunzhigang@example.com', '123456');
SELECT create_user_no_email('chenzhuang', 'chenzhuang@example.com', '123456');
SELECT create_user_no_email('niedi', 'niedi@example.com', '123456');

-- 查看所有用户
SELECT id, username, email FROM auth.users 
JOIN user_profiles ON auth.users.id = user_profiles.id;

-- 删除临时函数
DROP FUNCTION IF EXISTS create_user_no_email(TEXT, TEXT, TEXT);
