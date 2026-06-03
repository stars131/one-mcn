import Parser from "rss-parser";
import { RawSourceItem, SourceAdapter } from "./types";

const parser = new Parser();

export const rssAdapter: SourceAdapter = {
  id: "rss",
  name: "RSS Feed",
  type: "rss",
  async fetch({ config = {}, limit = 20 }) {
    const feedUrl = String(config.url || "");
    if (!feedUrl) throw new Error("RSS URL 不能为空");
    const feed = await parser.parseURL(feedUrl);
    return feed.items.slice(0, limit).map((item) => ({
      externalId: item.guid || item.link,
      title: item.title || "Untitled",
      summary: item.contentSnippet || item.content,
      url: item.link,
      author: item.creator || item.author,
      publishedAt: item.isoDate || item.pubDate,
      sourceName: feed.title || String(config.name || "RSS"),
      sourceType: "rss",
      platform: "rss",
      rawData: item as Record<string, unknown>
    }));
  },
  async normalize(items: RawSourceItem[]) {
    return items.map((item) => ({
      title: item.title,
      summary: item.summary,
      url: item.url,
      sourceName: item.sourceName,
      sourceType: "rss",
      platform: item.platform,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
      rawHeatScore: 30,
      rawMetrics: item.rawMetrics,
      rawData: item.rawData,
      tags: []
    }));
  }
};
