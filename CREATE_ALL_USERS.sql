-- 创建4个台球计分小程序用户
-- 用户名: zhaobo, sunzhigang, chenzhuang, niedi
-- 密码: 123456 (6个字符)

-- 创建 zhaobo 用户
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES 
    ('zhaobo@example.com', crypt('123456', gen_salt('bf')), NOW())
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- 创建用户资料
INSERT INTO public.user_profiles (id, username)
SELECT id, 'zhaobo' FROM auth.users WHERE email = 'zhaobo@example.com'
ON CONFLICT (id) DO UPDATE SET username = 'zhaobo';

-- 创建 sunzhigang 用户
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES 
    ('sunzhigang@example.com', crypt('123456', gen_salt('bf')), NOW())
ON CONFLICT (email) DO NOTHING
RETURNING id;

INSERT INTO public.user_profiles (id, username)
SELECT id, 'sunzhigang' FROM auth.users WHERE email = 'sunzhigang@example.com'
ON CONFLICT (id) DO UPDATE SET username = 'sunzhigang';

-- 创建 chenzhuang 用户
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES 
    ('chenzhuang@example.com', crypt('123456', gen_salt('bf')), NOW())
ON CONFLICT (email) DO NOTHING
RETURNING id;

INSERT INTO public.user_profiles (id, username)
SELECT id, 'chenzhuang' FROM auth.users WHERE email = 'chenzhuang@example.com'
ON CONFLICT (id) DO UPDATE SET username = 'chenzhuang';

-- 创建 niedi 用户
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES 
    ('niedi@example.com', crypt('123456', gen_salt('bf')), NOW())
ON CONFLICT (email) DO NOTHING
RETURNING id;

INSERT INTO public.user_profiles (id, username)
SELECT id, 'niedi' FROM auth.users WHERE email = 'niedi@example.com'
ON CONFLICT (id) DO UPDATE SET username = 'niedi';

-- 查看所有用户（验证创建成功）
SELECT 
    auth.users.id,
    auth.users.email, 
    public.user_profiles.username
FROM auth.users 
LEFT JOIN public.user_profiles ON auth.users.id = public.user_profiles.id;
