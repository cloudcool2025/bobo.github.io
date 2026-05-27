# 台球计分板 - 部署指南

## 功能概述

这是一个支持外网访问的4人台球在线计分系统，包含以下功能：

### 用户功能
- 用户注册和登录
- 头像上传（最大2MB）
- 发起对局、参与计分
- 查看历史记录和个人统计

### 管理员功能
- 修改所有对局数据
- 管理用户账号

### 对局统计
- 比分记录
- 白球犯规次数
- 运气球次数
- 胜场、败场、胜率统计

## 部署步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录
2. 创建新项目，记录项目 URL 和 anon key
3. 在 SQL Editor 中执行 `supabase/migrations/20240101000000_initial_schema.sql` 的内容

### 2. 配置环境变量

创建 `.env` 文件：

```env
VITE_SUPABASE_URL=你的supabase项目url
VITE_SUPABASE_ANON_KEY=你的supabase_anon_key
```

### 3. 创建管理员账号

1. 先注册一个普通用户账号
2. 在 Supabase SQL Editor 中执行：

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE username = '你的用户名';
```

### 4. 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 部署完成后即可通过外网访问

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 Supabase 配置

# 启动开发服务器
npm run dev
```

## 技术栈

- 前端：React 18 + TypeScript + Tailwind CSS
- 后端：Supabase (PostgreSQL + Auth + Storage)
- 状态管理：Zustand
- 部署：Vercel
