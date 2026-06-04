# 热点菜单使用说明

本文档说明 `/root/one-mcn` 的热点菜单如何接入 `/root/wlwl-hotspot-collector`。

## 技术栈

本项目使用 Next.js 14 App Router、React、TypeScript、Prisma、PostgreSQL、Tailwind CSS 和 Vitest。

## 服务关系

- 主项目：`one-mcn`，本机端口 `3000`
- 热点搜集工具：`wlwl-hotspot-collector`，本机端口 `4100`
- 热点菜单页面：`/hot-topics`
- 本项目内部搜索接口：`POST /api/hot-topics/search`
- 热点搜集工具接口：`POST /api/hotspot-agent/search`
- 热点搜集工具健康检查：`GET /health`

默认情况下，本项目会调用：

```text
http://127.0.0.1:4100/api/hotspot-agent/search
```

## 环境变量

```bash
HOTSPOT_AGENT_BASE_URL="http://127.0.0.1:4100"
HOTSPOT_AGENT_API_KEY=""
HOTSPOT_AGENT_TIMEOUT_MS="30000"
```

如果不配置 `HOTSPOT_AGENT_BASE_URL`，本项目也会默认使用 `http://127.0.0.1:4100`。

## 菜单使用

进入 `/hot-topics` 后，用户主要填写：

- 热点关键词：主搜索词，例如 `OpenAI`、`AI Agent`、`AI自媒体`
- 平台：从小红书、抖音、公众号、快手、B站、GitHub、X、Facebook、知乎中选择
- 内容类型：图文、短视频等
- 创作要求：本轮想找什么样的热点
- 时间范围：`24h`、`3d`、`7d`
- 返回数量：`5`、`10`、`20`、`50`
- 匹配人设：可选，用于把热点和当前人设做匹配

点击“提取热点”后，本项目会：

1. 调用 `/api/hot-topics/search`。
2. 组装关键词、平台、内容类型、时间范围、数量和人设摘要。
3. 转发给 `wlwl-hotspot-collector` 的 `/api/hotspot-agent/search`。
4. 把返回的热点保存为本项目 `HotTopic`。
5. 刷新热点列表。

## 健康状态

热点菜单右侧“热点来源”会显示 AI HOT 是否可用。

- `AI HOT 已连接`：可以直接调用热点搜集工具。
- `AI HOT 未连接，本地兜底`：热点搜集工具不可用，本项目只搜索已经入库的本地热点。

## 请求示例

本项目发送给热点搜集工具的请求形态：

```json
{
  "keyword": "OpenAI",
  "keywords": ["OpenAI", "AI Agent"],
  "platforms": ["小红书"],
  "contentTypes": ["图文"],
  "persona": {
    "profileId": "ip_profile_id",
    "name": "小八的人设",
    "niche": "AI工具教学",
    "targetAudience": "想用AI提高效率的小白",
    "userPainPoints": ["不知道怎么选工具"],
    "valueProposition": "把复杂AI工具讲成可照做的步骤",
    "toneStyle": "清晰、实用、轻松",
    "blockedTopics": ["夸大收益"]
  },
  "requirements": {
    "goal": "找适合今天创作的热点",
    "audienceLevel": "按当前人设",
    "timeRange": "7d",
    "region": "zh-CN",
    "hotness": "rising",
    "riskTolerance": "low",
    "count": 10
  }
}
```

## 字段保存

热点搜集工具返回的数据会保存到 `HotTopic`：

- `title` -> 标题
- `summary` / `whyRelevant` -> 摘要
- `url` -> 原文链接和去重依据
- `sourceName` -> 来源
- `tags` -> 标签
- `hotnessScore` -> 热度
- `personaFitScore` -> 人设匹配
- `contentAngles` -> 推荐创作角度
- `rawData` -> 原始返回数据

## 当前边界

本轮只适配菜单使用和接口调用，不调整热点列表的最终展示方式。热点卡片的信息层级、筛选方式、分组方式和摘要样式会在后续单独确定。
