import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";

export const DEFAULT_HOTSPOT_AGENT_BASE_URL = "http://127.0.0.1:4100";

type PersonaPayload = {
  profileId?: string;
  name?: string;
  niche?: string;
  targetAudience?: string;
  userPainPoints?: string[];
  valueProposition?: string;
  toneStyle?: string;
  blockedTopics?: string[];
};

type HotTopicSearchInput = {
  keyword: string;
  keywords: string[];
  platforms: string[];
  contentTypes: string[];
  ipProfileId?: string;
  requirements: {
    goal: string;
    audienceLevel: string;
    timeRange: "24h" | "3d" | "7d";
    region: string;
    hotness: "breaking" | "rising" | "stable" | "evergreen";
    riskTolerance: "low" | "medium" | "high";
    count: number;
  };
};

type ExternalHotTopicItem = {
  externalId?: string;
  title: string;
  summary?: string;
  url?: string;
  sourceName?: string;
  platform?: string;
  matchedPlatforms?: string[];
  tags?: string[];
  hotnessScore?: number;
  trend?: string;
  publishedAt?: string;
  capturedAt?: string;
  whyRelevant?: string;
  personaFitScore?: number;
  riskLevel?: "low" | "medium" | "high";
  riskNotes?: string[];
  contentAngles?: { title: string; contentType?: string; hook?: string; outline?: string[] }[];
  recommendedAction?: string;
  rawData?: Record<string, unknown>;
};

type ExternalHotTopicResponse = {
  querySummary?: string;
  source?: { name?: string; url?: string; fetchedAt?: string };
  items?: ExternalHotTopicItem[];
};

function asArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function uniqueList(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function score(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.max(0, Math.min(100, numberValue)) : fallback;
}

async function getPersona(input: HotTopicSearchInput, userId: string, operatingAccountId: string | null): Promise<PersonaPayload | undefined> {
  if (!input.ipProfileId) return undefined;
  const profile = await prisma.ipProfile.findFirst({
    where: { id: input.ipProfileId, userId, operatingAccountId }
  });
  if (!profile) return undefined;
  return {
    profileId: profile.id,
    name: profile.name,
    niche: profile.niche,
    targetAudience: profile.targetAudience,
    userPainPoints: asArray(profile.userPainPoints),
    valueProposition: profile.valueProposition,
    toneStyle: profile.toneStyle,
    blockedTopics: asArray(profile.blockedTopics)
  };
}

async function callExternalHotspotAgent(input: HotTopicSearchInput, persona?: PersonaPayload): Promise<ExternalHotTopicResponse | null> {
  const baseUrl = (process.env.HOTSPOT_AGENT_BASE_URL || DEFAULT_HOTSPOT_AGENT_BASE_URL).replace(/\/$/, "");
  if (!baseUrl) return null;
  const timeoutMs = Number(process.env.HOTSPOT_AGENT_TIMEOUT_MS || 30000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl}/api/hotspot-agent/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.HOTSPOT_AGENT_API_KEY ? { Authorization: `Bearer ${process.env.HOTSPOT_AGENT_API_KEY}` } : {})
      },
      body: JSON.stringify({
        keyword: input.keyword,
        keywords: uniqueList([input.keyword, ...input.keywords]),
        platforms: input.platforms,
        contentTypes: input.contentTypes,
        persona,
        requirements: input.requirements
      }),
      signal: controller.signal
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `热点 Agent 返回 ${res.status}`);
    return (await res.json()) as ExternalHotTopicResponse;
  } finally {
    clearTimeout(timer);
  }
}

async function searchLocalHotTopics(input: HotTopicSearchInput, userId: string, operatingAccountId: string | null): Promise<ExternalHotTopicResponse> {
  const terms = uniqueList([input.keyword, ...input.keywords]).map((item) => item.toLowerCase());
  const existing = await prisma.hotTopic.findMany({
    where: { userId, operatingAccountId },
    orderBy: [{ recommendationScore: "desc" }, { collectedAt: "desc" }],
    take: 100
  });
  const items = existing
    .filter((item) => {
      const text = [item.title, item.summary, item.keyword, item.platform, item.sourceName, ...asArray(item.tags)].join(" ").toLowerCase();
      const keywordMatched = terms.some((term) => text.includes(term));
      const platformMatched = !input.platforms.length || input.platforms.includes(item.platform || "") || asArray(item.suitablePlatforms).some((platform) => input.platforms.includes(platform));
      return keywordMatched && platformMatched;
    })
    .slice(0, input.requirements.count)
    .map((item) => ({
      externalId: item.id,
      title: item.title,
      summary: item.summary || undefined,
      url: item.url || undefined,
      sourceName: item.sourceName,
      platform: item.platform || undefined,
      matchedPlatforms: asArray(item.suitablePlatforms),
      tags: asArray(item.tags),
      hotnessScore: item.heatScore,
      trend: "stable",
      capturedAt: item.collectedAt.toISOString(),
      whyRelevant: item.summary || "与关键词匹配，可继续分析后生成内容。",
      personaFitScore: item.matchScore || item.recommendationScore || 50,
      riskLevel: "low" as const,
      riskNotes: [],
      contentAngles: asArray(item.recommendedAngles as unknown).map((title) => ({ title })),
      recommendedAction: "generate_content"
    }));
  return {
    querySummary: `本地热点库中匹配“${input.keyword}”的结果。`,
    source: { name: "本项目本地热点库", fetchedAt: new Date().toISOString() },
    items
  };
}

function mapItemForCreate(item: ExternalHotTopicItem, input: HotTopicSearchInput, userId: string, operatingAccountId: string | null, ipProfileId?: string) {
  const matchedPlatforms = uniqueList([...(item.matchedPlatforms || []), item.platform || ""]);
  const contentAngles = Array.isArray(item.contentAngles) ? item.contentAngles : [];
  const heatScore = score(item.hotnessScore, 50);
  const matchScore = score(item.personaFitScore, 50);
  return {
    userId,
    operatingAccountId,
    ipProfileId,
    title: item.title,
    summary: item.summary || item.whyRelevant || "",
    url: item.url,
    platform: item.platform || matchedPlatforms[0] || input.platforms[0],
    sourceName: item.sourceName || "外部热点 Agent",
    sourceType: "hot_feed",
    keyword: input.keyword,
    tags: uniqueList(item.tags || input.keywords),
    heatScore,
    matchScore,
    businessScore: score(item.personaFitScore, 50),
    competitionScore: item.riskLevel === "high" ? 70 : item.riskLevel === "medium" ? 45 : 25,
    freshnessScore: item.publishedAt || item.capturedAt ? 85 : 50,
    recommendationScore: Math.round(heatScore * 0.45 + matchScore * 0.4 + (item.riskLevel === "high" ? 5 : 15)),
    recommendedAngles: contentAngles,
    suitablePlatforms: matchedPlatforms.length ? matchedPlatforms : input.platforms,
    contentFormats: input.contentTypes,
    rawMetrics: { trend: item.trend, riskLevel: item.riskLevel, riskNotes: item.riskNotes || [] },
    rawData: item,
    collectedAt: item.capturedAt ? new Date(item.capturedAt) : new Date()
  } as any;
}

export async function searchHotTopicsWorkflow(input: HotTopicSearchInput) {
  const userId = await getDefaultUserId();
  const operatingAccountId = await getCurrentOperatingAccountId(userId);
  const persona = await getPersona(input, userId, operatingAccountId);
  let external = await callExternalHotspotAgent(input, persona).catch(() => null);
  if (!external) external = await searchLocalHotTopics(input, userId, operatingAccountId);
  const validItems = (external.items || []).filter((item) => item.title?.trim()).slice(0, input.requirements.count);
  const items = [];
  let createdCount = 0;
  for (const item of validItems) {
    const duplicate = item.url
      ? await prisma.hotTopic.findFirst({ where: { userId, operatingAccountId, url: item.url } })
      : await prisma.hotTopic.findFirst({ where: { userId, operatingAccountId, title: item.title } });
    if (duplicate) {
      items.push(duplicate);
      continue;
    }
    items.push(await prisma.hotTopic.create({ data: mapItemForCreate(item, input, userId, operatingAccountId, persona?.profileId) }));
    createdCount += 1;
  }
  return {
    querySummary: external.querySummary || `围绕“${input.keyword}”筛选适合创作的热点。`,
    source: external.source || { name: "热点搜集工具", url: process.env.HOTSPOT_AGENT_BASE_URL || DEFAULT_HOTSPOT_AGENT_BASE_URL, fetchedAt: new Date().toISOString() },
    createdCount,
    totalCount: items.length,
    items
  };
}
