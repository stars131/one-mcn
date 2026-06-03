import { calculateMetricRates, MetricInput } from "./metrics";

export type Benchmarks = {
  avgViews: number;
  avgLikeRate: number;
  avgCommentRate: number;
  avgSaveRate: number;
  avgShareRate: number;
  avgFollowerGainRate: number;
  avgCompletionRate: number;
  avgEngagementRate: number;
};

export function diagnoseContentPerformance(metric: MetricInput, benchmarks: Benchmarks) {
  const r = calculateMetricRates(metric);
  const tags: string[] = [];
  if (metric.views > benchmarks.avgViews * 1.2 && r.engagementRate < benchmarks.avgEngagementRate * 0.8) tags.push("标题强但内容承接弱");
  if (metric.views < benchmarks.avgViews * 0.8 && r.saveRate > benchmarks.avgSaveRate * 1.2) tags.push("内容质量强但标题/封面弱");
  if (r.saveRate > benchmarks.avgSaveRate * 1.2) tags.push("实用价值强", "收藏价值高");
  if (r.commentRate > benchmarks.avgCommentRate * 1.2) tags.push("讨论度强");
  if (r.followerGainRate > benchmarks.avgFollowerGainRate * 1.2) tags.push("转粉能力强", "值得复用");
  if (r.shareRate > benchmarks.avgShareRate * 1.2) tags.push("传播价值高");
  if (r.completionRate > benchmarks.avgCompletionRate * 1.2 && r.followerGainRate < benchmarks.avgFollowerGainRate * 0.8) tags.push("需要优化 CTA");
  if (metric.views < benchmarks.avgViews * 0.7 && r.engagementRate < benchmarks.avgEngagementRate * 0.8) tags.push("需要优化选题");
  if (metric.views > benchmarks.avgViews * 1.5 || r.engagementRate > benchmarks.avgEngagementRate * 1.5) tags.push("高于平均");
  if (metric.views < benchmarks.avgViews * 0.6 && r.engagementRate < benchmarks.avgEngagementRate * 0.6) tags.push("低于平均", "需要复盘");
  return [...new Set(tags)];
}
