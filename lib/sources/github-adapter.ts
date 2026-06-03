import { SourceAdapter, RawSourceItem } from "./types";

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  updated_at: string;
  created_at: string;
  open_issues_count: number;
};

function sinceFor(timeRange?: "day" | "week" | "month") {
  const d = new Date();
  d.setDate(d.getDate() - (timeRange === "day" ? 1 : timeRange === "month" ? 30 : 7));
  return d.toISOString().slice(0, 10);
}

export const githubAdapter: SourceAdapter = {
  id: "github",
  name: "GitHub Search Repositories",
  type: "github",
  async fetch({ config = {}, keywords = [], limit = 10, timeRange = "week", language }) {
    const token = String(config.token || process.env.GITHUB_TOKEN || "");
    const query = [
      keywords.length ? keywords.join(" ") : String(config.query || "AI agent"),
      `pushed:>=${sinceFor(timeRange)}`,
      language ? `language:${language}` : ""
    ].filter(Boolean).join(" ");
    const url = new URL("https://api.github.com/search/repositories");
    url.searchParams.set("q", query);
    url.searchParams.set("sort", "stars");
    url.searchParams.set("order", "desc");
    url.searchParams.set("per_page", String(Math.min(limit, 50)));
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) throw new Error(`GitHub API 请求失败：${res.status} ${await res.text()}`);
    const data = (await res.json()) as { items: GitHubRepo[] };
    return data.items.map((repo) => ({
      externalId: String(repo.id),
      title: repo.full_name,
      summary: repo.description || undefined,
      url: repo.html_url,
      publishedAt: repo.updated_at,
      sourceName: "GitHub",
      sourceType: "github",
      platform: "github",
      rawMetrics: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count
      },
      rawData: {
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        language: repo.language,
        topics: repo.topics || [],
        updated_at: repo.updated_at,
        created_at: repo.created_at,
        open_issues_count: repo.open_issues_count
      }
    }));
  },
  async normalize(items: RawSourceItem[]) {
    return items.map((item) => {
      const stars = Number(item.rawMetrics?.stars || 0);
      const forks = Number(item.rawMetrics?.forks || 0);
      return {
        title: item.title,
        summary: item.summary,
        url: item.url,
        sourceName: item.sourceName,
        sourceType: item.sourceType,
        platform: item.platform,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
        rawHeatScore: Math.min(100, Math.log10(stars + 1) * 22 + Math.log10(forks + 1) * 10),
        rawMetrics: item.rawMetrics,
        rawData: item.rawData,
        tags: Array.isArray(item.rawData?.topics) ? (item.rawData?.topics as string[]) : []
      };
    });
  }
};
