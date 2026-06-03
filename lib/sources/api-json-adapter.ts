import { RawSourceItem, SourceAdapter } from "./types";

function getPath(source: unknown, path?: unknown): unknown {
  if (!path || typeof path !== "string") return undefined;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

export const apiJsonAdapter: SourceAdapter = {
  id: "api_json",
  name: "API JSON",
  type: "api_json",
  async fetch({ config = {}, limit = 20 }) {
    const endpoint = String(config.url || "");
    if (!endpoint) throw new Error("API JSON URL 不能为空");
    const url = new URL(endpoint);
    const queryParams = (config.queryParams || {}) as Record<string, string>;
    Object.entries(queryParams).forEach(([key, value]) => url.searchParams.set(key, value));
    const method = String(config.method || "GET").toUpperCase();
    const res = await fetch(url, {
      method,
      headers: (config.headers || {}) as Record<string, string>,
      body: method === "POST" ? JSON.stringify(config.body || {}) : undefined
    });
    if (!res.ok) throw new Error(`API JSON 请求失败：${res.status} ${await res.text()}`);
    const json = await res.json();
    const rows = getPath(json, config.dataPath) ?? json;
    if (!Array.isArray(rows)) throw new Error("API JSON dataPath 必须指向数组");
    return rows.slice(0, limit).map((row) => ({
      externalId: String(getPath(row, config.externalIdPath) || getPath(row, config.urlPath) || ""),
      title: String(getPath(row, config.titlePath) || "Untitled"),
      summary: String(getPath(row, config.summaryPath) || ""),
      url: String(getPath(row, config.urlPath) || ""),
      author: String(getPath(row, config.authorPath) || ""),
      publishedAt: String(getPath(row, config.publishedAtPath) || ""),
      sourceName: String(config.name || "API JSON"),
      sourceType: "api_json",
      platform: String(config.platform || "api"),
      rawMetrics: (getPath(row, config.metricsPath) as Record<string, unknown>) || {},
      rawData: row as Record<string, unknown>
    }));
  },
  async normalize(items: RawSourceItem[]) {
    return items.map((item) => ({
      title: item.title,
      summary: item.summary,
      url: item.url,
      sourceName: item.sourceName,
      sourceType: "api_json",
      platform: item.platform,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
      rawHeatScore: Number(item.rawMetrics?.score || item.rawMetrics?.heat || 20),
      rawMetrics: item.rawMetrics,
      rawData: item.rawData,
      tags: []
    }));
  }
};
