import { RawSourceItem, SourceAdapter } from "./types";

export const manualAdapter: SourceAdapter = {
  id: "manual",
  name: "Manual Input",
  type: "manual",
  async fetch({ manualItems = [] }) {
    return manualItems.map((item) => ({ ...item, sourceType: "manual", sourceName: item.sourceName || "Manual" }));
  },
  async normalize(items: RawSourceItem[]) {
    return items.map((item) => ({
      title: item.title,
      summary: item.summary,
      url: item.url,
      sourceName: item.sourceName,
      sourceType: "manual",
      platform: item.platform || "manual",
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
      rawHeatScore: 10,
      rawMetrics: item.rawMetrics,
      rawData: item.rawData,
      tags: []
    }));
  }
};
