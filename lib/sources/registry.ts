import { apiJsonAdapter } from "./api-json-adapter";
import { githubAdapter } from "./github-adapter";
import { manualAdapter } from "./manual-adapter";
import { rssAdapter } from "./rss-adapter";
import { SourceAdapter, SourceType } from "./types";

const adapters: Record<SourceType, SourceAdapter | undefined> = {
  github: githubAdapter,
  rss: rssAdapter,
  api_json: apiJsonAdapter,
  manual: manualAdapter,
  webpage: undefined
};

export function getSourceAdapter(type: SourceType): SourceAdapter {
  const adapter = adapters[type];
  if (!adapter) throw new Error(`${type} adapter 暂未实现或未启用`);
  return adapter;
}

export function listSourceAdapters() {
  return Object.values(adapters).filter(Boolean) as SourceAdapter[];
}
