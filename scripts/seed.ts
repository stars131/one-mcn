import { prisma } from "@/lib/db/prisma";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@one-mcn.local" },
    update: {},
    create: { email: "demo@one-mcn.local", name: "Demo Creator" }
  });
  const profile = await prisma.ipProfile.create({
    data: {
      userId: user.id,
      name: "AI 工具效率 IP",
      niche: "AI Agent 与个人效率",
      targetAudience: "希望用 AI 提升工作效率的创作者和自由职业者",
      userPainPoints: ["不知道选题", "内容缺乏转化", "复盘没有数据依据"],
      valueProposition: "用可执行的方法拆解 AI 工具和自动化工作流",
      toneStyle: "专业、清晰、可复制",
      platforms: ["小红书", "公众号", "知乎"],
      monetizationGoals: ["课程", "咨询", "工具模板"],
      keywords: ["AI Agent", "自动化", "效率工具"],
      competitors: [],
      blockedTopics: ["违规爬虫", "刷量"]
    }
  });
  await prisma.source.createMany({
    data: [
      { userId: user.id, name: "GitHub AI Agent", type: "github", config: { query: "AI agent" } },
      { userId: user.id, name: "手动热点", type: "manual", config: {} }
    ],
    skipDuplicates: true
  });
  const topic = await prisma.topic.create({
    data: {
      userId: user.id,
      ipProfileId: profile.id,
      title: "用 AI Agent 把个人内容运营拆成 5 个自动化节点",
      corePoint: "工作流拆解比单点工具更重要",
      targetAudience: "个人创作者",
      userPainPoint: "不知道如何系统运营",
      platform: "小红书",
      contentType: "图文",
      trafficScore: 78,
      businessScore: 82,
      difficultyScore: 45,
      outline: ["定位", "热点", "选题", "内容", "复盘"]
    }
  });
  const content = await prisma.content.create({
    data: {
      userId: user.id,
      topicId: topic.id,
      platform: "小红书",
      contentType: "图文",
      title: "个人创作者的 AI 运营工作流",
      titles: ["个人创作者的 AI 运营工作流"],
      coverTexts: ["一个人也能做 MCN 式复盘"],
      hook: "不要先追工具，先把运营链路拆清楚。",
      body: "## 核心流程\n定位 -> 热点 -> 选题 -> 内容 -> 发布 -> 数据 -> 复盘。",
      cta: "保存这套流程，下次直接套用。",
      tags: ["AI Agent", "个人 IP", "内容运营"]
    }
  });
  await prisma.contentMetric.create({
    data: { userId: user.id, contentId: content.id, platform: "小红书", views: 4200, likes: 260, comments: 42, saves: 380, shares: 61, followersGained: 37, completionRate: 0.72, clickRate: 0.08 }
  });
}

main().finally(() => prisma.$disconnect());
