# Hotspot Agent API

本文档用于开发独立的热点搜集网站或 Agent。本项目不负责维护各平台爬虫和采集规则，只负责把用户关键词、平台、人设和创作要求发送给外部热点 Agent，并展示、保存、分析返回的热点。

## 调用方向

- 本项目入口：`POST /api/hot-topics/search`
- 外部热点 Agent 需要实现：`POST /api/hotspot-agent/search`
- 本项目默认使用 `http://127.0.0.1:4100`。配置 `HOTSPOT_AGENT_BASE_URL` 后，会调用：

```text
${HOTSPOT_AGENT_BASE_URL}/api/hotspot-agent/search
```

## 认证

如果本项目配置了 `HOTSPOT_AGENT_API_KEY`，请求外部 Agent 时会携带：

```http
Authorization: Bearer <HOTSPOT_AGENT_API_KEY>
Content-Type: application/json
```

外部 Agent 可以选择校验这个 token。

## 请求体

```json
{
  "keyword": "AI自媒体",
  "keywords": ["AI自媒体", "AI", "自媒体"],
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
    "timeRange": "24h",
    "region": "zh-CN",
    "hotness": "rising",
    "riskTolerance": "low",
    "count": 10
  }
}
```

## 请求字段

- `keyword`：主关键词，必填。
- `keywords`：扩展关键词，本项目会包含主关键词。
- `platforms`：目标平台数组，可选值包括小红书、抖音、公众号、快手、B站、GitHub、X、Facebook、知乎。
- `contentTypes`：内容类型数组，例如图文、短视频、长文、帖子、教程。
- `persona`：当前人设摘要，可能为空。外部 Agent 应用它判断热点是否适合用户。
- `requirements.goal`：用户本轮需求。
- `requirements.timeRange`：`24h`、`3d`、`7d`。
- `requirements.hotness`：`breaking`、`rising`、`stable`、`evergreen`。
- `requirements.riskTolerance`：`low`、`medium`、`high`。
- `requirements.count`：期望返回条数，最大 100；热点菜单默认 10。

## 成功响应

```json
{
  "querySummary": "围绕 AI 自媒体，筛选近24小时适合小白教学账号创作的热点。",
  "source": {
    "name": "外部热点搜集Agent",
    "url": "https://hotspot.example.com",
    "fetchedAt": "2026-06-04T13:00:00.000Z"
  },
  "items": [
    {
      "externalId": "hot_001",
      "title": "某AI工具发布新功能，引发创作者讨论",
      "summary": "这个热点适合做成小白教程，重点解释新功能能解决什么实际问题。",
      "url": "https://hotspot.example.com/items/hot_001",
      "sourceName": "微博热榜",
      "platform": "小红书",
      "matchedPlatforms": ["小红书", "抖音"],
      "tags": ["AI工具", "效率", "教程"],
      "hotnessScore": 86,
      "trend": "rising",
      "publishedAt": "2026-06-04T10:30:00.000Z",
      "capturedAt": "2026-06-04T13:00:00.000Z",
      "whyRelevant": "目标用户关心AI工具怎么落地，这个热点可以转化为具体教程。",
      "personaFitScore": 92,
      "riskLevel": "low",
      "riskNotes": ["避免夸大工具效果"],
      "contentAngles": [
        {
          "title": "小白怎么用这个功能省1小时",
          "contentType": "图文",
          "hook": "这个AI新功能不是给高手用的，小白反而最该先学。",
          "outline": ["功能解决什么问题", "三步上手", "适合哪些工作场景"]
        }
      ],
      "recommendedAction": "generate_content"
    }
  ]
}
```

## 响应字段要求

- `items[].title` 必填。
- `items[].summary` 建议必填，用于热点卡片摘要。
- `items[].url` 建议提供，用于去重和追溯来源。
- `items[].sourceName` 建议提供，例如微博热榜、知乎热榜、GitHub Trending。
- `items[].hotnessScore` 范围 0-100。
- `items[].personaFitScore` 范围 0-100。
- `items[].riskLevel` 可选值：`low`、`medium`、`high`。
- `items[].contentAngles` 用于本项目展示推荐创作角度，后续也会用于一键生成内容。

## 错误响应

外部 Agent 出错时建议返回：

```json
{
  "error": "NO_MATCHED_HOTSPOTS",
  "message": "没有找到匹配当前关键词和人设的热点",
  "retryable": false
}
```

建议错误码：

- `HOTSPOT_AGENT_UNAVAILABLE`
- `INVALID_QUERY`
- `SOURCE_AUTH_FAILED`
- `SOURCE_RATE_LIMITED`
- `NO_MATCHED_HOTSPOTS`
- `UPSTREAM_TIMEOUT`

## 本项目保存映射

外部返回的热点会被保存为本项目 `HotTopic`：

- `title` -> `HotTopic.title`
- `summary` 或 `whyRelevant` -> `HotTopic.summary`
- `url` -> `HotTopic.url`
- `platform` -> `HotTopic.platform`
- `sourceName` -> `HotTopic.sourceName`
- `tags` -> `HotTopic.tags`
- `hotnessScore` -> `HotTopic.heatScore`
- `personaFitScore` -> `HotTopic.matchScore`
- `contentAngles` -> `HotTopic.recommendedAngles`
- `matchedPlatforms` -> `HotTopic.suitablePlatforms`
- 原始 item 完整保存到 `HotTopic.rawData`

## 边界

外部热点 Agent 负责：

- 采集、搜索、去重、热度判断。
- 维护平台采集规则、登录态、反爬、数据源适配。
- 根据关键词、人设和要求返回适合创作的热点摘要。

本项目负责：

- 收集用户关键词、平台、人设和创作要求。
- 调用外部热点 Agent。
- 保存和展示热点摘要。
- 基于热点做人设匹配、AI 分析、选题和内容生成。
