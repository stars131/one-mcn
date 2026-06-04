# One MCN Handoff

更新时间：2026-06-04

## 项目位置

- 主项目：`/root/one-mcn`
- 热点采集项目：`/root/wlwl-hotspot-collector`
- GitHub：`git@github.com:stars131/one-mcn.git`
- 当前主项目最新提交：以 `git log --oneline -1` 为准；每轮完成后统一提交并推送到 GitHub。

## 服务状态

- 主项目 systemd：`one-mcn`
- 主项目本机端口：`127.0.0.1:3000`
- 热点采集 systemd：`wlwl-hotspot-collector`
- 热点采集本机端口：`127.0.0.1:4100`
- Nginx 已用于反代域名访问，域名目标：`mcn.wlwl-tools.com`

常用命令：

```bash
cd /root/one-mcn
npm run verify
npm run prisma:push
systemctl restart one-mcn
git status --short
```

## 技术栈

- Next.js 14 App Router
- React + TypeScript
- Prisma + PostgreSQL
- Tailwind CSS + 本地 UI 组件
- Vitest + Next build 作为主要验证链路
- systemd 管理本机服务

## 品牌与产品方向

- 主名：小八的后援团
- Slogan：你的专属MCN，已就位
- 品牌图标：WLWL，不使用“助”字
- 设计方向：自然有机风，使用 amber / stone / olive / sage，大地色、米色纸感背景、不规则圆角和柔和阴影；避免纯黑、冷色主视觉、尖锐几何和硬阴影
- 产品原则：简约，不把所有配置堆在同一个页面；需要时再展开或切换
- 目标用户：小白也能使用，尽量通过选项、对话、按钮完成流程
- 项目最高规范见 `PROJECT_RULES.md`：
  - 现在开始不只是做 MVP，直接按照最优秀的方案进行。
  - 任何修改必须先提出至少两种可行的方案供用户选择。
  - 对话式采集要像 GPT 对话一样逐轮产出选项，用户选择后累积到资料或内容上下文。
  - 对话页面必须像 Apple 公司的产品一样简约，首屏只保留核心对话和下一步动作。
  - 整体前端风格使用自然有机风，详见 `PROJECT_RULES.md`。

## 已完成核心功能

- 登录/注册：
  - 注册需要邮箱、密码、确认密码、邀请码
  - 登录只需要邮箱和密码
  - 浏览器自动填充字段已补 `name` / `autocomplete`
- 多运营账号：
  - 同一个用户可管理多个运营账号
  - 控制台首页可切换当前运营账号
  - 核心数据按运营账号隔离
- 模型配置：
  - 支持积分制和自用模型两种模式
  - 积分制只显示积分，不显示服务器模型配置
  - 自用模型支持多套配置
  - 每套自用模型里，语言模型、多模态模型、生图模型都可单独设置 Provider / URL / Key / Model
  - 真实服务器模型 key 只在 `.env`，不要提交
- 人设：
  - 原“IP 定位”以后统一叫“人设”
  - 页面是 GPT 式会话结构：顶部一行全站导航 + 左侧可收起人设会话历史 + 中间主对话区 + 右侧辅助栏
  - 人设页面布局参考 ChatGPT：页面接近浏览器全宽，左侧历史栏和右侧辅助栏都收窄，中间对话框占据主视觉
  - 左侧栏命名为“对话历史”，标题和历史项保持单行截断，不要换行撑开
  - 主对话区只展示当前轮：上一轮用户回答 + 当前 Agent 问题；更早消息只做留档
  - 右侧辅助栏放“查看完整留档”和“编辑详细资料”，保持轻量、窄栏、默认折叠，不要挤占主对话区
  - 右侧折叠栏展开后只能内部滚动，不允许撑开页面并影响左侧历史和中间对话区
  - 页面是 Apple 式简约：大尺寸单主对话卡 + 明确浅色对话内框 + 轻量完成度
  - 提示、快捷选项和状态信息要弱化存在感，主对话框必须是视觉核心
  - 对话中标题显示“人设建立中”；资料达到可创作标准后显示“人设已建立！”
  - 右上角百分比是整个人设建立进度，由资料完整度、Agent completion 和 missing 缺口综合判断
  - 人设建立完成后询问用户是否去创作；选择“去创作”跳转到内容工作台
  - 首轮提供“从零开始 / 我已有账号 / 先定平台 / 先找变现”四个轻量入口
  - 人设 Agent 每轮调用真实大模型，承接用户回答后提出下一问
  - 每轮返回助手话术、3-5 个可点击选项、结构化 `patch`、完成度和待补齐项
  - 用户点击选项或自由输入都会作为聊天消息展示，并累积到 `notes`
  - 已新增真实大模型采集接口：`/api/ip-profiles/agent-collect`
  - 已新增持久化会话接口：`/api/persona-conversations`
  - 采集 workflow 预留 identity / audience / platform / value / monetization / boundary 六类 agent 输出
  - 人设摘要和详细资料默认折叠，避免首屏复杂
- 平台适配：
  - 已新增统一平台注册表：小红书、抖音、公众号、快手、B站、GitHub、X、Facebook、知乎
  - 当前先保留平台选项、内容类型、数据录入方式、prompt hints 和 adapter 状态
  - 后续每个平台单独维护 adapter、指标字段和平台提示词
  - 能用选项的位置不再让用户从空白开始填写平台
- 热点：
  - “来源”和“热点”合并为一个热点模块，一级导航不再展示“来源”
  - `/sources` 旧入口会跳转到 `/hot-topics`
  - 普通用户不看后台 URL，热点来源选择只作为热点页里的小型折叠区
  - 可启用免费热点接口，也可花积分购买一天的付费热点接口
  - 热点雷达主流程：输入关键词、平台、内容类型、创作要求和人设，从外部热点 Agent 提取热点摘要并入库
  - 已新增统一热点搜索接口：`/api/hot-topics/search`
  - 热点菜单已按 `/root/wlwl-hotspot-collector/docs/one-mcn-api.md` 适配 AI HOT 搜集工具
  - 默认热点搜集工具地址：`http://127.0.0.1:4100`，未配置 `HOTSPOT_AGENT_BASE_URL` 时也会使用这个地址
  - 热点菜单支持工具文档里的时间范围：`24h`、`3d`、`7d`
  - 热点菜单返回数量选项：5、10、20、50；后端最大兼容热点工具的 100
  - 已新增热点搜集工具健康检查 API：`/api/hot-topics/collector-health`
  - 热点雷达页面已升级为第一版创作决策工作台：顶部搜索 + 平台筛选 + 指标条 + 热点榜单 + 右侧详情 + 当前人设推荐
  - 热点雷达不在用户界面突出单一来源；AI HOT 只是当前已接入的数据源之一，后续可继续接入其他平台
  - 热点详情保留适合原因、创作角度、风险提示、趋势小图和生成内容入口；具体展示方式后续继续按用户反馈调整
  - 热点详情动作链路：保存为选题 -> `/topics`，生成初稿 -> `/contents`，加入创作计划 -> `/calendar`
  - 热点 AI 动作已加入统一加载态：按钮禁用、状态文案、轻量骨架和跳动点动画；后续可升级为流式输出
  - 外部热点 Agent 对接文档：`docs/hotspot-agent-api.md`
  - 热点菜单使用文档：`docs/hotspot-menu-usage.md`
  - 外部 Agent 配置：`HOTSPOT_AGENT_BASE_URL`、`HOTSPOT_AGENT_API_KEY`、`HOTSPOT_AGENT_TIMEOUT_MS`
  - 外部热点搜集工具不可用时，搜索接口会在本项目本地热点库做关键词兜底匹配
  - 热点可一键根据热点 + 人设生成内容初稿
- 选题：
  - 已改成对话式入口
  - 用户选择平台、内容类型、方向，再用一句话生成选题
  - 选题可一键生成内容初稿
- 内容/日历：
  - 从选题或热点生成内容初稿后，会自动创建一条明天的发布计划
  - `/contents` 已改为内容 Agent 工作台，不再展示手动新增复杂表单
  - 内容 Agent 通过对话采集平台、内容类型、目标、风格、素材来源，当前先返回结构化预览
  - 已新增内容 Agent 占位接口：`/api/contents/agent-chat`
  - 内容预览区展示标题、开头、正文、CTA、标签和最近草稿；真实生成策略和流式输出后续细化
- 分析：
  - 已按统一平台注册表预留不同平台数据输入方式
  - 数据录入平台改为可选项
  - 平台评分权重已补齐快手、GitHub、X、Facebook 占位
- 管理员：
  - `/admin`
  - 管理免费热点接口 URL
  - 管理付费热点接口 URL
  - 管理每日付费热点价格
  - 管理员由 `ADMIN_EMAILS` 环境变量控制

## 重要文件

- Prisma 模型：`prisma/schema.prisma`
- LLM 调用：`lib/ai/llm-client.ts`
- 自用模型设置组件：`components/model-settings-form.tsx`
- 模型设置 API：`app/api/settings/model-preference/route.ts`
- 人设对话页组件：`components/ip-profile-conversation.tsx`
- 热点雷达组件：`components/hot-topics-workbench.tsx`
- 热点访问组件：`components/hotspot-access-panel.tsx`
- 热点搜索 workflow：`lib/workflows/search-hot-topics.ts`
- 外部热点 Agent 接口文档：`docs/hotspot-agent-api.md`
- 热点菜单使用文档：`docs/hotspot-menu-usage.md`
- 热点搜索 API：`app/api/hot-topics/search/route.ts`
- 热点搜集工具健康检查 API：`app/api/hot-topics/collector-health/route.ts`
- 热点一键生成内容 API：`app/api/hot-topics/[id]/generate-content/route.ts`
- 内容 Agent 工作台：`components/content-agent-workbench.tsx`
- 内容 Agent 占位 API：`app/api/contents/agent-chat/route.ts`
- 选题对话页组件：`components/topics-workbench.tsx`
- 分析页组件：`components/analytics-dashboard.tsx`
- 管理员页：`app/admin/page.tsx`
- 管理员热点设置 API：`app/api/admin/hotspot-settings/route.ts`
- 管理员权限：`lib/admin.ts`
- 系统设置读取：`lib/app-settings.ts`
- 项目最高规范：`PROJECT_RULES.md`
- 平台注册表：`lib/platforms/registry.ts`
- 人设 Agent 采集 workflow：`lib/workflows/ip-profile-agents.ts`
- 人设 Agent 采集 API：`app/api/ip-profiles/agent-collect/route.ts`
- 人设会话 workflow：`lib/workflows/persona-conversations.ts`
- 人设会话 API：`app/api/persona-conversations/*`

## 数据模型要点

- `User.aiCredits`：用户积分，默认 1000
- `UserModelPreference`：
  - `mode`: `server_credits` 或 `custom`
  - `selectedConfigId`: 当前自用模型配置
- `UserModelConfig`：
  - `textProvider`, `textBaseUrl`, `textModel`, `textApiKey`
  - `multimodalProvider`, `multimodalBaseUrl`, `multimodalModel`, `multimodalApiKey`
  - `imageProvider`, `imageBaseUrl`, `imageModel`, `imageApiKey`
- `AppSetting`：
  - 当前用于保存热点接口配置，key 为 `hotspot_access`
- `Source`：
  - 普通用户通过免费/付费入口创建，不在页面展示 URL
- `PersonaConversation`：
  - GPT 式人设会话，关联用户、运营账号和可选人设
  - 保存标题、当前问题、上一轮回答、Agent 回复、选项和完成度
- `PersonaMessage`：
  - 保存人设会话里的完整 user / assistant 留档
  - 主界面默认只显示最近一轮，完整记录在折叠留档里查看

## 环境变量

`.env` 中有真实密钥，不要提交。

公开示例在 `.env.example`：

```bash
AI_PROVIDER="newapi"
AI_API_KEY=""
AI_BASE_URL="https://elysiver.h-e.top"
AI_TEXT_MODEL="deepseek-v4-pro"
AI_MULTIMODAL_MODEL="deepseek-v4-pro"
AI_IMAGE_MODEL="deepseek-v4-pro"
ADMIN_EMAILS="demo@one-mcn.local"
HOTSPOT_AGENT_BASE_URL="http://127.0.0.1:4100"
HOTSPOT_AGENT_API_KEY=""
HOTSPOT_AGENT_TIMEOUT_MS="30000"
```

## 演示账号

```text
邮箱：demo@one-mcn.local
密码：one-mcn-demo
```

真实用户密码不可查看，只能重置。

## 最近一次验证

已执行并通过：

```bash
npm run verify
systemctl restart one-mcn
```

最近一次本轮验证：

- `npm run verify`：测试 16 个通过，Next build 成功
- `systemctl restart one-mcn`
- `systemctl is-active one-mcn`：`active`

接口验证过：

- 登录
- 三类独立模型配置保存
- 免费热点启用
- 热点访问状态
- 热点搜集工具健康检查：`/api/hot-topics/collector-health` 返回 `mode: external`
- 热点搜索：`/api/hot-topics/search` 已按 `OpenAI` 关键词调用 AI HOT，并成功入库 3 条热点
- 内容 Agent 占位接口：`/api/contents/agent-chat` 已验证可返回 assistantMessage、options 和 draftPreview

## 下一步建议

优先级建议：

1. 继续降低小白使用门槛：
   - 热点卡片提供“适合我的原因 / 推荐平台 / 生成风格”选择
   - 生成内容前给用户 2-3 个方案选择
   - 人设 Agent 后续可把聊天记录持久化为独立表，支持跨设备恢复完整对话
2. 优化热点展示页：
   - 分免费热点和付费热点标签页
   - 显示热度、推荐理由、适合平台、可生成内容类型
3. 完善内容生成链路：
   - 从热点生成内容时，先生成 3 个内容方向让用户选
   - 用户选定后再生成初稿
4. 优化日历：
   - 内容生成后自动进入日历
   - 支持拖拽调整发布时间
5. 优化分析页：
   - 小红书/公众号/抖音分别做数据录入面板
   - 支持截图、表格、手动输入三种方式
6. 管理员页扩展：
   - 设置服务器模型
   - 给用户充值积分
   - 配置邀请码
   - 查看付费热点购买记录

## 注意事项

- 不要把 `.env` 或真实 key 提交到 GitHub。
- 如果 Prisma 提示删除旧字段，需要确认是否只是前一版临时字段；目前最近一次 `db push --accept-data-loss` 是为把自用模型拆成三类独立 URL/Key。
- 用户希望页面“简约”，默认不要展示太多配置；用切换、折叠、弹出、对话选项来承载复杂能力。
- 所有主要操作尽量面向小白：提供按钮、选项、推荐方案，不让用户手动填 JSON 或复杂表单。
- 每轮项目更新结束后：本地更新 `HANDOFF.md`，验证通过后统一提交并推送到 GitHub。
