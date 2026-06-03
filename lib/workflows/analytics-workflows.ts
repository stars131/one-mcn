import { prisma } from "@/lib/db/prisma";
import { aggregateByContentType, aggregateByPlatform, aggregateByTimeRange, aggregateByTopicTag, findHighFollowerGainContents, findHighSaveContents, findTopContents, findWorstContents, MetricRecord } from "@/lib/analytics/aggregation";
import { calculateBenchmarks, calculateMetricRates } from "@/lib/analytics/metrics";
import { calculateContentScore } from "@/lib/analytics/scoring";
import { diagnoseContentPerformance } from "@/lib/analytics/insights";
import { generateJson } from "@/lib/ai/llm-client";
import { prompts } from "@/lib/ai/prompts";

async function loadMetricRecords(userId: string, operatingAccountId: string | undefined, periodStart: Date, periodEnd: Date): Promise<MetricRecord[]> {
  const rows = await prisma.contentMetric.findMany({
    where: { userId, operatingAccountId, collectedAt: { gte: periodStart, lte: periodEnd } },
    include: { content: { include: { topic: { include: { hotTopic: true } } } } }
  });
  return rows.map((m) => ({
    id: m.id,
    contentId: m.contentId,
    platform: m.platform,
    contentType: m.content.contentType,
    tags: Array.isArray(m.content.tags) ? (m.content.tags as string[]) : Array.isArray(m.content.topic?.hotTopic?.tags) ? (m.content.topic?.hotTopic?.tags as string[]) : [],
    title: m.content.title,
    views: m.views,
    likes: m.likes,
    comments: m.comments,
    saves: m.saves,
    shares: m.shares,
    followersGained: m.followersGained,
    completionRate: m.completionRate,
    clickRate: m.clickRate,
    collectedAt: m.collectedAt
  }));
}

export async function calculateAnalyticsWorkflow(input: { userId: string; operatingAccountId?: string; periodStart: Date; periodEnd: Date }) {
  const metrics = await loadMetricRecords(input.userId, input.operatingAccountId, input.periodStart, input.periodEnd);
  const totals = metrics.reduce((acc, m) => ({ contents: acc.contents + 1, views: acc.views + m.views, likes: acc.likes + m.likes, comments: acc.comments + m.comments, saves: acc.saves + m.saves, shares: acc.shares + m.shares, followersGained: acc.followersGained + m.followersGained }), { contents: 0, views: 0, likes: 0, comments: 0, saves: 0, shares: 0, followersGained: 0 });
  const rates = calculateMetricRates({ views: totals.views, likes: totals.likes, comments: totals.comments, saves: totals.saves, shares: totals.shares, followersGained: totals.followersGained });
  const benchmarks = calculateBenchmarks(metrics);
  const enriched = metrics.map((m) => ({ ...m, rates: calculateMetricRates(m), score: calculateContentScore(m), diagnostics: diagnoseContentPerformance(m, benchmarks) }));
  const platformAgg = aggregateByPlatform(metrics);
  const contentTypeAgg = aggregateByContentType(metrics);
  const topicTagAgg = aggregateByTopicTag(metrics);
  const trends7 = aggregateByTimeRange(metrics, 7);
  const trends30 = aggregateByTimeRange(metrics, 30);
  const summaryData = { totals, rates, benchmarks, platformAgg, contentTypeAgg, topicTagAgg, trends7, trends30, top: findTopContents(metrics), worst: findWorstContents(metrics), highSave: findHighSaveContents(metrics), highFollower: findHighFollowerGainContents(metrics), contents: enriched };
  const topPlatform = platformAgg.sort((a, b) => b.views - a.views)[0]?.name;
  const topContentType = contentTypeAgg.sort((a, b) => b.views - a.views)[0]?.name;
  const topTopicTags = topicTagAgg.sort((a, b) => b.views - a.views).slice(0, 10).map((i) => i.name);
  const snapshot = await prisma.analyticsSnapshot.create({
    data: {
      userId: input.userId,
      operatingAccountId: input.operatingAccountId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalContents: totals.contents,
      totalViews: totals.views,
      totalLikes: totals.likes,
      totalComments: totals.comments,
      totalSaves: totals.saves,
      totalShares: totals.shares,
      totalFollowersGained: totals.followersGained,
      avgLikeRate: rates.likeRate,
      avgCommentRate: rates.commentRate,
      avgSaveRate: rates.saveRate,
      avgShareRate: rates.shareRate,
      avgFollowerGainRate: rates.followerGainRate,
      topPlatform,
      topContentType,
      topTopicTags,
      summaryData
    }
  });
  return { snapshot, ...summaryData };
}

export async function generateReviewReportWorkflow(input: { userId: string; operatingAccountId?: string; periodStart: Date; periodEnd: Date }) {
  const analytics = await calculateAnalyticsWorkflow(input);
  const result = await generateJson<any>([{ role: "user", content: prompts.reviewReport({ analytics }) }]);
  return prisma.reviewReport.create({
    data: {
      userId: input.userId,
      operatingAccountId: input.operatingAccountId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      summary: String(result.summary || ""),
      keyFindings: result.keyFindings || [],
      winningPatterns: result.winningPatterns || [],
      losingPatterns: result.losingPatterns || [],
      recommendedActions: [...(result.continueDoing || []), ...(result.stopDoing || []), ...(result.testNext || [])],
      nextTopics: result.nextTopicSuggestions || [],
      rawData: result
    }
  });
}
