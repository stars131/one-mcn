export type MetricInput = {
  views: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  followersGained: number;
  completionRate?: number;
  clickRate?: number;
};

const rate = (value: number, views: number) => (views > 0 ? value / views : 0);

export function calculateMetricRates(metric: MetricInput) {
  const views = metric.views || 0;
  return {
    likeRate: rate(metric.likes, views),
    commentRate: rate(metric.comments, views),
    saveRate: rate(metric.saves, views),
    shareRate: rate(metric.shares, views),
    followerGainRate: rate(metric.followersGained, views),
    clickRate: metric.clickRate || 0,
    completionRate: metric.completionRate || 0,
    engagementRate: rate(metric.likes + metric.comments + metric.saves + metric.shares, views)
  };
}

export function calculateBenchmarks(metrics: MetricInput[]) {
  if (!metrics.length) {
    return { avgViews: 0, avgLikeRate: 0, avgCommentRate: 0, avgSaveRate: 0, avgShareRate: 0, avgFollowerGainRate: 0, avgCompletionRate: 0, avgEngagementRate: 0 };
  }
  const rates = metrics.map(calculateMetricRates);
  const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
  return {
    avgViews: avg(metrics.map((m) => m.views)),
    avgLikeRate: avg(rates.map((r) => r.likeRate)),
    avgCommentRate: avg(rates.map((r) => r.commentRate)),
    avgSaveRate: avg(rates.map((r) => r.saveRate)),
    avgShareRate: avg(rates.map((r) => r.shareRate)),
    avgFollowerGainRate: avg(rates.map((r) => r.followerGainRate)),
    avgCompletionRate: avg(rates.map((r) => r.completionRate)),
    avgEngagementRate: avg(rates.map((r) => r.engagementRate))
  };
}
