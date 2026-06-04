# One MCN Handoff

更新时间：2026-06-03

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
  - 页面是 Apple 式简约：大尺寸单主对话卡 + 明确浅色对话内框 + 轻量完成度 + 折叠摘要/详情
  - 提示、快捷选项和状态信息要弱化存在感，主对话框必须是视觉核心
  - 首轮提供“从零开始 / 我已有账号 / 先定平台 / 先找变现”四个轻量入口
  - 人设 Agent 每轮调用真实大模型，承接用户回答后提出下一问
  - 每轮返回助手话术、3-5 个可点击选项、结构化 `patch`、完成度和待补齐项
  - 用户点击选项或自由输入都会作为聊天消息展示，并累积到 `notes`
  - 已新增真实大模型采集接口：`/api/ip-profiles/agent-collect`
  - 采集 workflow 预留 identity / audience / platform / value / monetization / boundary 六类 agent 输出
  - 人设摘要和详细资料默认折叠，避免首屏复杂
- 平台适配：
  - 已新增统一平台注册表：小红书、抖音、公众号、快手、B站、GitHub、X、Facebook、知乎
  - 当前先保留平台选项、内容类型、数据录入方式、prompt hints 和 adapter 状态
  - 后续每个平台单独维护 adapter、指标字段和平台提示词
  - 能用选项的位置不再让用户从空白开始填写平台
- 热点：
  - 普通用户不看后台 URL
  - 可启用免费热点接口
  - 可花积分购买一天的付费热点接口
  - 热点雷达展示热点列表
  - 不需要手动添加热点
  - 热点可一键根据热点 + 人设生成内容初稿
- 选题：
  - 已改成对话式入口
  - 用户选择平台、内容类型、方向，再用一句话生成选题
  - 选题可一键生成内容初稿
- 内容/日历：
  - 从选题或热点生成内容初稿后，会自动创建一条明天的发布计划
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
- 热点一键生成内容 API：`app/api/hot-topics/[id]/generate-content/route.ts`
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
