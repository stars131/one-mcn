import { MetricInput } from "./metrics";

const weightsByPlatform: Record<string, Record<string, number>> = {
  "小红书": { views: 0.15, likes: 0.12, comments: 0.2, saves: 0.25, shares: 0.08, followers: 0.15, completion: 0.05 },
  "公众号": { views: 0.25, likes: 0.1, comments: 0.1, saves: 0.15, shares: 0.2, followers: 0.15, completion: 0.05 },
  "抖音": { views: 0.15, likes: 0.1, comments: 0.2, saves: 0.1, shares: 0.1, followers: 0.2, completion: 0.15 },
  "快手": { views: 0.15, likes: 0.1, comments: 0.2, saves: 0.1, shares: 0.1, followers: 0.2, completion: 0.15 },
  "B站": { views: 0.15, likes: 0.1, comments: 0.2, saves: 0.1, shares: 0.1, followers: 0.2, completion: 0.15 },
  "GitHub": { views: 0.15, likes: 0.25, comments: 0.1, saves: 0.25, shares: 0.1, followers: 0.1, completion: 0.05 },
  "X": { views: 0.2, likes: 0.15, comments: 0.2, saves: 0.1, shares: 0.2, followers: 0.1, completion: 0.05 },
  "Facebook": { views: 0.2, likes: 0.15, comments: 0.2, saves: 0.1, shares: 0.2, followers: 0.1, completion: 0.05 },
  "知乎": { views: 0.15, likes: 0.1, comments: 0.2, saves: 0.25, shares: 0.15, followers: 0.1, completion: 0.05 }
};

const defaultWeights = { views: 0.2, likes: 0.15, comments: 0.15, saves: 0.2, shares: 0.1, followers: 0.15, completion: 0.05 };
const normalize = (value: number, cap: number) => Math.min(100, cap > 0 ? (value / cap) * 100 : 0);

export function calculateContentScore(metric: MetricInput & { platform?: string }) {
  const w = weightsByPlatform[metric.platform || ""] || defaultWeights;
  const viewScore = normalize(metric.views, 10000);
  const likeScore = normalize(metric.likes, Math.max(metric.views * 0.08, 1));
  const commentScore = normalize(metric.comments, Math.max(metric.views * 0.02, 1));
  const saveScore = normalize(metric.saves, Math.max(metric.views * 0.05, 1));
  const shareScore = normalize(metric.shares, Math.max(metric.views * 0.03, 1));
  const followerScore = normalize(metric.followersGained, Math.max(metric.views * 0.01, 1));
  const completionScore = normalize(metric.completionRate || 0, 1);
  const overallScore =
    viewScore * w.views + likeScore * w.likes + commentScore * w.comments + saveScore * w.saves + shareScore * w.shares + followerScore * w.followers + completionScore * w.completion;
  return { viewScore, likeScore, commentScore, saveScore, shareScore, followerScore, completionScore, overallScore };
}

export function calculateRecommendationScore(input: { heatScore: number; matchScore: number; businessScore: number; freshnessScore: number; competitionScore: number }) {
  return input.heatScore * 0.3 + input.matchScore * 0.25 + input.businessScore * 0.25 + input.freshnessScore * 0.1 - input.competitionScore * 0.1;
}
