import { prompts } from "@/lib/ai/prompts";
import { generateJson } from "@/lib/ai/llm-client";
import { prisma } from "@/lib/db/prisma";
import { calculateRecommendationScore } from "@/lib/analytics/scoring";

type HotTopicAnalysis = {
  summary?: string;
  heatScore?: number;
  matchScore?: number;
  businessScore?: number;
  competitionScore?: number;
  freshnessScore?: number;
  recommendationScore?: number;
  recommendedAngles?: unknown[];
  keywords?: string[];
};

export async function analyzeHotTopicWorkflow(input: { hotTopicId: string; ipProfileId: string }) {
  const hotTopic = await prisma.hotTopic.findUniqueOrThrow({ where: { id: input.hotTopicId } });
  const ipProfile = await prisma.ipProfile.findUniqueOrThrow({ where: { id: input.ipProfileId } });
  const prompt = hotTopic.sourceType === "github" ? prompts.githubProjectAnalysis({ hotTopic, ipProfile }) : prompts.normalHotTopicAnalysis({ hotTopic, ipProfile });
  const result = await generateJson<HotTopicAnalysis>([{ role: "user", content: prompt }]);
  const heatScore = result.heatScore ?? hotTopic.heatScore;
  const matchScore = result.matchScore ?? 0;
  const businessScore = result.businessScore ?? 0;
  const competitionScore = result.competitionScore ?? 0;
  const freshnessScore = result.freshnessScore ?? hotTopic.freshnessScore;
  const recommendationScore = result.recommendationScore ?? calculateRecommendationScore({ heatScore, matchScore, businessScore, competitionScore, freshnessScore });
  return prisma.hotTopic.update({
    where: { id: hotTopic.id },
    data: {
      ipProfileId: ipProfile.id,
      summary: result.summary || hotTopic.summary,
      heatScore,
      matchScore,
      businessScore,
      competitionScore,
      freshnessScore,
      recommendationScore,
      recommendedAngles: result.recommendedAngles || [],
      keyword: result.keywords?.[0],
      tags: result.keywords || [],
      suitablePlatforms: Array.from(new Set((result.recommendedAngles || []).flatMap((a: any) => a.suitablePlatforms || a.platform || []))),
      contentFormats: Array.from(new Set((result.recommendedAngles || []).flatMap((a: any) => a.contentFormats || a.contentFormat || []))),
      status: "analyzed",
      analyzedAt: new Date()
    } as any
  });
}

export async function generateTopicsWorkflow(input: { hotTopicId: string; ipProfileId: string }) {
  const hotTopic = await prisma.hotTopic.findUniqueOrThrow({ where: { id: input.hotTopicId } });
  const ipProfile = await prisma.ipProfile.findUniqueOrThrow({ where: { id: input.ipProfileId } });
  const history = await prisma.contentMetric.findMany({ where: { userId: hotTopic.userId }, include: { content: true }, orderBy: { views: "desc" }, take: 10 });
  const items = await generateJson<any[]>([{ role: "user", content: prompts.topicGeneration({ hotTopic, ipProfile, history }) }]);
  return prisma.topic.createManyAndReturn({
    data: items.slice(0, 10).map((item) => ({
      userId: hotTopic.userId,
      ipProfileId: ipProfile.id,
      hotTopicId: hotTopic.id,
      title: String(item.title),
      corePoint: String(item.corePoint || ""),
      targetAudience: String(item.targetAudience || ""),
      userPainPoint: String(item.userPainPoint || ""),
      platform: String(item.platform || "小红书"),
      contentType: String(item.contentType || "图文"),
      trafficScore: Number(item.trafficScore || 0),
      businessScore: Number(item.businessScore || 0),
      difficultyScore: Number(item.difficultyScore || 0),
      reason: String(item.reason || ""),
      outline: item.outline || []
    })) as any
  });
}

export async function generateContentWorkflow(input: { topicId: string; platform: string; contentType: string }) {
  const topic = await prisma.topic.findUniqueOrThrow({ where: { id: input.topicId }, include: { ipProfile: true } });
  const result = await generateJson<any>([{ role: "user", content: prompts.contentGeneration({ topic, ipProfile: topic.ipProfile, platform: input.platform, contentType: input.contentType }) }]);
  return prisma.content.create({
    data: {
      userId: topic.userId,
      topicId: topic.id,
      platform: input.platform,
      contentType: input.contentType,
      title: String(result.titles?.[0] || topic.title),
      titles: result.titles || [],
      coverTexts: result.coverTexts || [],
      hook: result.hook || "",
      body: result.body || "",
      cta: result.cta || "",
      tags: result.tags || [],
      commentGuide: result.commentGuide || ""
    }
  });
}

export async function adaptContentWorkflow(input: { contentId: string; targetPlatform: string }) {
  const content = await prisma.content.findUniqueOrThrow({ where: { id: input.contentId }, include: { topic: { include: { ipProfile: true } } } });
  const result = await generateJson<any>([{ role: "user", content: prompts.platformAdaptation({ content, topic: content.topic, targetPlatform: input.targetPlatform }) }]);
  return prisma.content.create({
    data: {
      userId: content.userId,
      topicId: content.topicId,
      platform: input.targetPlatform,
      contentType: content.contentType,
      title: String(result.titles?.[0] || content.title),
      titles: result.titles || [],
      coverTexts: result.coverTexts || [],
      hook: result.hook || "",
      body: result.body || "",
      cta: result.cta || "",
      tags: result.tags || [],
      commentGuide: result.commentGuide || ""
    }
  });
}
