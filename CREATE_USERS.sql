-- 创建4个台球计分小程序用户
-- 用户名: zhaobo, sunzhigang, chenzhuang, niedi
-- 密码: 123456 (6个字符)

-- 查看可用的 auth 函数
SELECT proname, proargtypes::regtype[] 
FROM pg_proc 
WHERE pronamespace = 'auth'::regnamespace 
AND proname LIKE '%user%';

-- 使用正确的函数创建用户
-- Supabase 使用 auth.sign_up 或 auth.admin_api 来创建用户

-- 方法1: 直接插入到 auth.users 表（需要超级用户权限）
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES 
    ('sunzhigang@example.com', crypt('123456', gen_salt('bf')), NOW()),
    ('chenzhuang@example.com', crypt('123456', gen_salt('bf')), NOW()),
    ('niedi@example.com', crypt('123456', gen_salt('bf')), NOW())
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- 创建用户资料
INSERT INTO public.user_profiles (id, username)
SELECT id, 'sunzhigang' FROM auth.users WHERE email = 'sunzhigang@example.com'
ON CONFLICT (id) DO UPDATE SET username = 'sunzhigang';

INSERT INTO public.user_profiles (id, username)
SELECT id, 'chenzhuang' FROM auth.users WHERE email = 'chenzhuang@example.com'
ON CONFLICT (id) DO UPDATE SET username = 'chenzhuang';

INSERT INTO public.user_profiles (id, username)
SELECT id, 'niedi' FROM auth.users WHERE email = 'niedi@example.com'
ON CONFLICT (id) DO UPDATE SET username = 'niedi';

-- 查看所有用户
SELECT id, username, email FROM auth.users 
JOIN user_profiles ON auth.users.id = user_profiles.id;
