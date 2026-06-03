# 小八的后援团

你的专属MCN，已就位。面向个人创作者提供接近小型 MCN 团队的半自动运营工作台。

## 技术栈

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui 风格组件
- PostgreSQL + Prisma
- Zod API 输入校验
- OpenAI / OpenRouter / DeepSeek 可配置 LLM Client
- Recharts 数据看板
- 插件化 Source Adapter 与可扩展 Workflow

## 本地运行

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

默认地址：`http://localhost:3000/dashboard`

## 核心目录

- `app/`：页面与 API Route
- `lib/sources/`：GitHub、RSS、API JSON、Manual Source Adapter
- `lib/workflows/`：采集、AI 分析、内容生成、分析和复盘工作流
- `lib/ai/`：统一 LLM Client、Prompt、JSON Parser
- `lib/analytics/`：指标、评分、聚合、诊断
- `prisma/schema.prisma`：数据库模型

## 环境变量

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/one_mcn?schema=public"
AI_PROVIDER="newapi"
AI_API_KEY=""
AI_BASE_URL="https://elysiver.h-e.top"
AI_TEXT_MODEL="deepseek-v4-pro"
AI_MULTIMODAL_MODEL="deepseek-v4-pro"
AI_IMAGE_MODEL="deepseek-v4-pro"
GITHUB_TOKEN=""
INITIAL_INVITE_CODE="ONE-MCN-2026"
```

## 邀请码

默认 seed 会创建 `INITIAL_INVITE_CODE`。也可以手动创建：

```bash
npm run invite:create -- --code=ONE-MCN-2026 --maxUses=100 --label=early-access
```

## 合规边界

第一版只支持官方 API、RSS、用户手动导入、用户配置 JSON API 和 GitHub 官方 API。不实现绕过登录、验证码、反爬限制、自动刷互动、自动评论私信、抓取隐私数据或自动搬运内容。
