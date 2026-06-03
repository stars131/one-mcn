import { describe, expect, it } from "vitest";
import { aggregateByPlatform, aggregateByTimeRange, findHighFollowerGainContents, findHighSaveContents, findTopContents, MetricRecord } from "@/lib/analytics/aggregation";
import { diagnoseContentPerformance } from "@/lib/analytics/insights";
import { calculateBenchmarks, calculateMetricRates } from "@/lib/analytics/metrics";
import { calculateContentScore, calculateRecommendationScore } from "@/lib/analytics/scoring";

const baseMetric = {
  likes: 0,
  comments: 0,
  saves: 0,
  shares: 0,
  followersGained: 0,
  completionRate: 0,
  clickRate: 0
};

describe("analytics metrics", () => {
  it("handles zero views", () => {
    expect(calculateMetricRates({ views: 0, ...baseMetric }).engagementRate).toBe(0);
  });

  it("calculates rates", () => {
    const rates = calculateMetricRates({ views: 100, likes: 10, comments: 2, saves: 5, shares: 3, followersGained: 1, completionRate: 0.8, clickRate: 0.1 });
    expect(rates.likeRate).toBe(0.1);
    expect(rates.engagementRate).toBe(0.2);
  });

  it("calculates benchmarks", () => {
    const benchmarks = calculateBenchmarks([
      { views: 100, likes: 10, comments: 1, saves: 5, shares: 1, followersGained: 1, completionRate: 0.5 },
      { views: 300, likes: 30, comments: 3, saves: 15, shares: 3, followersGained: 3, completionRate: 0.7 }
    ]);
    expect(benchmarks.avgViews).toBe(200);
    expect(benchmarks.avgCompletionRate).toBe(0.6);
  });
});

describe("analytics scoring", () => {
  it("calculates hot topic recommendation score", () => {
    expect(calculateRecommendationScore({ heatScore: 80, matchScore: 70, businessScore: 60, freshnessScore: 50, competitionScore: 40 })).toBe(57.5);
  });

  it("calculates bounded content score", () => {
    const score = calculateContentScore({ views: 10000, likes: 800, comments: 200, saves: 500, shares: 300, followersGained: 100, completionRate: 1 });
    expect(score.overallScore).toBeGreaterThan(95);
    expect(score.overallScore).toBeLessThanOrEqual(100);
  });
});

describe("analytics insights and aggregation", () => {
  const metrics: MetricRecord[] = [
    { id: "1", contentId: "c1", title: "A", platform: "小红书", contentType: "图文", tags: ["AI"], collectedAt: new Date(), views: 1000, likes: 80, comments: 20, saves: 150, shares: 30, followersGained: 20, completionRate: 0.8, clickRate: 0.1 },
    { id: "2", contentId: "c2", title: "B", platform: "公众号", contentType: "文章", tags: ["运营"], collectedAt: new Date(), views: 300, likes: 5, comments: 1, saves: 3, shares: 2, followersGained: 0, completionRate: 0.3, clickRate: 0.01 }
  ];

  it("diagnoses reusable content", () => {
    const tags = diagnoseContentPerformance(metrics[0], {
      avgViews: 500,
      avgLikeRate: 0.02,
      avgCommentRate: 0.005,
      avgSaveRate: 0.01,
      avgShareRate: 0.005,
      avgFollowerGainRate: 0.001,
      avgCompletionRate: 0.4,
      avgEngagementRate: 0.04
    });
    expect(tags).toContain("值得复用");
    expect(tags).toContain("收藏价值高");
  });

  it("aggregates by platform", () => {
    expect(aggregateByPlatform(metrics).map((item) => item.name)).toEqual(["小红书", "公众号"]);
  });

  it("returns rankings and trends", () => {
    expect(findTopContents(metrics)[0].contentId).toBe("c1");
    expect(findHighSaveContents(metrics)[0].contentId).toBe("c1");
    expect(findHighFollowerGainContents(metrics)[0].contentId).toBe("c1");
    expect(aggregateByTimeRange(metrics, 7)).toHaveLength(7);
  });
});
