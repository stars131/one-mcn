import { format, subDays } from "date-fns";
import { calculateMetricRates, MetricInput } from "./metrics";
import { calculateContentScore } from "./scoring";

export type MetricRecord = MetricInput & {
  id: string;
  contentId: string;
  platform: string;
  contentType?: string;
  tags?: string[];
  collectedAt: Date;
  title?: string;
};

function summarize(items: MetricRecord[]) {
  const total = items.reduce(
    (acc, item) => ({
      contents: acc.contents + 1,
      views: acc.views + item.views,
      likes: acc.likes + item.likes,
      comments: acc.comments + item.comments,
      saves: acc.saves + item.saves,
      shares: acc.shares + item.shares,
      followersGained: acc.followersGained + item.followersGained
    }),
    { contents: 0, views: 0, likes: 0, comments: 0, saves: 0, shares: 0, followersGained: 0 }
  );
  return { ...total, ...calculateMetricRates(total) };
}

function groupBy<T extends string, R extends MetricRecord>(metrics: R[], key: (item: R) => T) {
  const map = new Map<T, R[]>();
  metrics.forEach((item) => map.set(key(item), [...(map.get(key(item)) || []), item]));
  return Array.from(map.entries()).map(([name, items]) => ({ name, ...summarize(items) }));
}

export const aggregateByPlatform = (metrics: MetricRecord[]) => groupBy(metrics, (m) => m.platform || "未设置");
export const aggregateByContentType = (metrics: MetricRecord[]) => groupBy(metrics, (m) => m.contentType || "未设置");

export function aggregateByTopicTag(metrics: MetricRecord[]) {
  const expanded: Array<MetricRecord & { tag: string }> = metrics.flatMap((metric) => (metric.tags?.length ? metric.tags : ["未标记"]).map((tag) => ({ ...metric, tag })));
  return groupBy(expanded, (m) => m.tag);
}

export function aggregateByTimeRange(metrics: MetricRecord[], days: number) {
  return Array.from({ length: days }).map((_, index) => {
    const day = format(subDays(new Date(), days - index - 1), "yyyy-MM-dd");
    const items = metrics.filter((m) => format(m.collectedAt, "yyyy-MM-dd") === day);
    return { date: day, ...summarize(items) };
  });
}

const byScore = (metrics: MetricRecord[], score: (m: MetricRecord) => number, count = 5) =>
  [...metrics].sort((a, b) => score(b) - score(a)).slice(0, count);

export const findTopContents = (metrics: MetricRecord[]) => byScore(metrics, (m) => calculateContentScore(m).overallScore);
export const findWorstContents = (metrics: MetricRecord[]) => [...metrics].sort((a, b) => calculateContentScore(a).overallScore - calculateContentScore(b).overallScore).slice(0, 5);
export const findHighSaveContents = (metrics: MetricRecord[]) => byScore(metrics, (m) => calculateMetricRates(m).saveRate);
export const findHighFollowerGainContents = (metrics: MetricRecord[]) => byScore(metrics, (m) => calculateMetricRates(m).followerGainRate);
