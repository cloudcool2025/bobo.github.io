-- 创建4个台球计分小程序用户
-- 用户名: zhaobo, sunzhigang, chenzhuang, niedi
-- 密码: 123456 (6个字符)

-- 使用 auth.create_user 创建用户
SELECT auth.create_user(
    'sunzhigang@example.com',
    '123456',
    '{"username": "sunzhigang"}'
);

SELECT auth.create_user(
    'chenzhuang@example.com',
    '123456',
    '{"username": "chenzhuang"}'
);

SELECT auth.create_user(
    'niedi@example.com',
    '123456',
    '{"username": "niedi"}'
);

-- 查看所有用户
SELECT id, username, email FROM auth.users 
JOIN user_profiles ON auth.users.id = user_profiles.id;
