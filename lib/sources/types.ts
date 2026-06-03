export type SourceType = "hot_feed" | "github" | "rss" | "api_json" | "manual" | "webpage";

export type RawSourceItem = {
  externalId?: string;
  title: string;
  summary?: string;
  url?: string;
  author?: string;
  publishedAt?: string;
  sourceName: string;
  sourceType: SourceType;
  platform?: string;
  rawMetrics?: Record<string, unknown>;
  rawData?: Record<string, unknown>;
};

export type NormalizedHotTopic = {
  title: string;
  summary?: string;
  url?: string;
  sourceName: string;
  sourceType: SourceType;
  platform?: string;
  publishedAt?: Date;
  rawHeatScore?: number;
  rawMetrics?: Record<string, unknown>;
  rawData?: Record<string, unknown>;
  tags?: string[];
};

export interface SourceAdapter {
  id: string;
  name: string;
  type: SourceType;
  fetch(params: {
    config?: Record<string, unknown>;
    keywords?: string[];
    limit?: number;
    timeRange?: "day" | "week" | "month";
    language?: string;
    manualItems?: RawSourceItem[];
  }): Promise<RawSourceItem[]>;
  normalize(items: RawSourceItem[]): Promise<NormalizedHotTopic[]>;
}
