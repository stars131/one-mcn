import { RawSourceItem, SourceAdapter } from "./types";

type FeedItem = {
  id?: string;
  externalId?: string;
  title: string;
  summary?: string;
  url?: string;
  author?: string;
  publishedAt?: string;
  platform?: string;
  tags?: string[];
  heatScore?: number;
  metrics?: Record<string, unknown>;
  rawMetrics?: Record<string, unknown>;
  rawData?: Record<string, unknown>;
};

function readItems(payload: unknown): FeedItem[] {
  if (Array.isArray(payload)) return payload as FeedItem[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as FeedItem[];
    if (Array.isArray(obj.hotTopics)) return obj.hotTopics as FeedItem[];
    if (Array.isArray(obj.data)) return obj.data as FeedItem[];
  }
  throw new Error("热点接口必须返回数组，或包含 items/hotTopics/data 数组");
}

export const hotFeedAdapter: SourceAdapter = {
  id: "hot_feed",
  name: "Hot Feed URL",
  type: "hot_feed",
  async fetch({ config = {}, keywords = [], limit = 20 }) {
    const endpoint = String(config.url || "");
    if (!endpoint) throw new Error("热点接口 URL 不能为空");
    const url = new URL(endpoint);
    if (keywords.length) url.searchParams.set("keywords", keywords.join(","));
    url.searchParams.set("limit", String(limit));
    const res = await fetch(url, {
      headers: (config.headers || {}) as Record<string, string>
    });
    if (!res.ok) throw new Error(`热点接口请求失败：${res.status} ${await res.text()}`);
    return readItems(await res.json()).slice(0, limit).map((item) => ({
      externalId: item.externalId || item.id || item.url,
      title: item.title,
      summary: item.summary,
      url: item.url,
      author: item.author,
      publishedAt: item.publishedAt,
      sourceName: String(config.name || "Hot Feed"),
      sourceType: "hot_feed",
      platform: item.platform || "feed",
      rawMetrics: item.rawMetrics || item.metrics || { heatScore: item.heatScore },
      rawData: item.rawData || (item as Record<string, unknown>)
    }));
  },
  async normalize(items: RawSourceItem[]) {
    return items.map((item) => ({
      title: item.title,
      summary: item.summary,
      url: item.url,
      sourceName: item.sourceName,
      sourceType: "hot_feed",
      platform: item.platform,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
      rawHeatScore: Number(item.rawMetrics?.heatScore || item.rawMetrics?.score || 30),
      rawMetrics: item.rawMetrics,
      rawData: item.rawData,
      tags: Array.isArray(item.rawData?.tags) ? (item.rawData?.tags as string[]) : []
    }));
  }
};
