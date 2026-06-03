import { describe, expect, it } from "vitest";
import { dedupeHotTopics } from "@/lib/sources/dedupe";
import { getSourceAdapter, listSourceAdapters } from "@/lib/sources/registry";
import { NormalizedHotTopic } from "@/lib/sources/types";

const item = (title: string, url?: string): NormalizedHotTopic => ({
  title,
  url,
  sourceName: "Manual",
  sourceType: "manual"
});

describe("source registry", () => {
  it("returns implemented adapters", () => {
    expect(getSourceAdapter("hot_feed").type).toBe("hot_feed");
    expect(getSourceAdapter("github").type).toBe("github");
    expect(getSourceAdapter("rss").type).toBe("rss");
    expect(getSourceAdapter("api_json").type).toBe("api_json");
    expect(getSourceAdapter("manual").type).toBe("manual");
    expect(listSourceAdapters().map((adapter) => adapter.type)).toEqual(["hot_feed", "github", "rss", "api_json", "manual"]);
  });

  it("keeps webpage reserved", () => {
    expect(() => getSourceAdapter("webpage")).toThrow("adapter 暂未实现");
  });
});

describe("dedupeHotTopics", () => {
  it("dedupes by url first", () => {
    const result = dedupeHotTopics([item("A", "https://example.com/a"), item("B", "https://example.com/a")]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("A");
  });

  it("dedupes by normalized title when url is missing", () => {
    const result = dedupeHotTopics([item("AI Agent"), item("ai   agent")], []);
    expect(result).toHaveLength(1);
  });

  it("filters existing keys", () => {
    expect(dedupeHotTopics([item("Known")], ["known"])).toHaveLength(0);
  });
});
