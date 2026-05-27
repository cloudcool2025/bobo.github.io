# 🎱 台球计分小程序 - 部署指南

## 项目概述

这是一个基于 React + TypeScript + Supabase 的台球计分小程序，支持好友之间创建比赛、统计得分和犯规次数、查看历史数据可视化等功能。

## 功能特性

- ✅ 用户注册/登录系统
- ✅ 创建比赛、选择对手
- ✅ 实时计分（支持快速加减分）
- ✅ 白球犯规统计
- ✅ 运气球记录
- ✅ 历史记录查询
- ✅ 数据可视化图表（胜负比例、得分趋势）
- ✅ 用户权限管理（管理员/普通用户）
- ✅ 头像上传（最大2MB）

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS 3
- **状态管理**: Zustand
- **图标**: Lucide React
- **图表**: Chart.js + react-chartjs-2
- **后端**: Supabase（认证、数据库、存储）

## 部署步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 注册账号
2. 创建新项目（设置项目名称和数据库密码）
3. 进入项目后，复制以下信息备用：
   - **Project URL**: 在 `Settings > API` 中找到
   - **Anon Key**: 在 `Settings > API` 中找到

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 3. 执行数据库迁移

1. 在 Supabase 控制台中进入 `SQL Editor`
2. 点击 `New query`
3. 复制并执行 `supabase/migrations/20240101000000_initial_schema.sql` 文件中的所有内容

### 4. 创建管理员账号

1. 先通过小程序注册一个账号
2. 在 Supabase SQL Editor 中执行：

```sql
UPDATE user_profiles SET role = 'admin' WHERE username = '你的用户名';
```

### 5. 部署到 Vercel（推荐）

#### 方式一：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel --prod
```

#### 方式二：通过 GitHub 集成

1. 将项目推送到 GitHub 仓库
2. 访问 [Vercel](https://vercel.com) 登录
3. 点击 `Add New Project`
4. 选择你的 GitHub 仓库
5. 在环境变量配置中添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. 点击 `Deploy`

### 6. 部署到 GitHub Pages

1. 安装 gh-pages：
```bash
npm install gh-pages --save-dev
```

2. 在 `package.json` 中添加：
```json
{
  "homepage": "https://你的GitHub用户名.github.io/仓库名称",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. 配置 vite.config.ts：
```typescript
export default defineConfig({
  base: '/仓库名称/',
  // ... 其他配置
})
```

4. 部署：
```bash
npm run deploy
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

## 项目结构

```
/workspace/
├── public/              # 静态资源
├── src/
│   ├── components/      # 组件
│   │   ├── StatsChart.tsx   # 数据可视化图表
│   │   └── Empty.tsx        # 空状态组件
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 工具库
│   │   └── supabase.ts      # Supabase 客户端
│   ├── pages/           # 页面组件
│   │   ├── Home.tsx         # 首页（对局列表）
│   │   ├── Login.tsx        # 登录/注册
│   │   ├── MatchDetail.tsx  # 对局详情
│   │   ├── History.tsx      # 历史记录
│   │   └── Profile.tsx      # 个人设置
│   ├── store/           # 状态管理
│   │   └── useAuthStore.ts  # 认证状态
│   ├── types/           # TypeScript 类型定义
│   ├── App.tsx          # 根组件
│   ├── main.tsx         # 入口文件
│   └── index.css        # 全局样式
├── supabase/
│   └── migrations/      # 数据库迁移脚本
├── .env                 # 环境变量
├── .env.example         # 环境变量示例
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 数据库结构

### user_profiles 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 用户ID（主键） |
| username | TEXT | 用户名 |
| avatar_url | TEXT | 头像URL |
| role | TEXT | 角色（admin/user） |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

### matches 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 对局ID（主键） |
| initiator_id | UUID | 发起者ID |
| opponent_id | UUID | 对手ID |
| initiator_score | INTEGER | 发起者得分 |
| opponent_score | INTEGER | 对手得分 |
| initiator_fouls | INTEGER | 发起者犯规次数 |
| opponent_fouls | INTEGER | 对手犯规次数 |
| initiator_lucky | INTEGER | 发起者运气球次数 |
| opponent_lucky | INTEGER | 对手运气球次数 |
| winner_id | UUID | 获胜者ID |
| status | TEXT | 状态（pending/playing/finished） |
| created_at | TIMESTAMPTZ | 创建时间 |
| finished_at | TIMESTAMPTZ | 结束时间 |

## 权限说明

- **普通用户**: 可以创建对局、修改自己参与的对局、查看所有历史记录
- **管理员**: 可以修改所有对局数据、删除对局

## 常见问题

### Q: 为什么登录后显示 "加载中..."？
A: 请检查 `.env` 文件中的 Supabase URL 和 Anon Key 是否正确配置。

### Q: 头像上传失败？
A: 确保上传的图片不超过 2MB，且格式为 JPG/PNG。

### Q: 如何重置密码？
A: 使用 Supabase 提供的密码重置功能，在登录页面点击忘记密码。

## 许可证

MIT License
