import { prisma } from "@/lib/db/prisma";
import { dedupeHotTopics } from "@/lib/sources/dedupe";
import { getSourceAdapter } from "@/lib/sources/registry";
import { RawSourceItem } from "@/lib/sources/types";

export async function collectHotTopicsWorkflow(input: {
  sourceId: string;
  keywords?: string[];
  limit?: number;
  timeRange?: "day" | "week" | "month";
  language?: string;
  manualItems?: RawSourceItem[];
}) {
  const source = await prisma.source.findUniqueOrThrow({ where: { id: input.sourceId } });
  const startedAt = new Date();
  const job = await prisma.fetchJob.create({
    data: { sourceId: source.id, sourceName: source.name, status: "running", startedAt, params: input as any }
  });
  try {
    const adapter = getSourceAdapter(source.type);
    const raw = await adapter.fetch({
      config: { ...(source.config as Record<string, unknown>), url: source.url, name: source.name },
      keywords: input.keywords,
      limit: input.limit,
      timeRange: input.timeRange,
      language: input.language,
      manualItems: input.manualItems
    });
    await prisma.sourceItem.createMany({
      data: raw.map((item) => ({
        sourceId: source.id,
        externalId: item.externalId,
        title: item.title,
        summary: item.summary,
        url: item.url,
        author: item.author,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
        rawMetrics: item.rawMetrics || {},
        rawData: item.rawData || {}
      })) as any
    });
    const normalized = await adapter.normalize(raw);
    const existing = await prisma.hotTopic.findMany({ where: { userId: source.userId, operatingAccountId: source.operatingAccountId }, select: { title: true, url: true } });
    const unique = dedupeHotTopics(normalized, existing.map((item) => item.url || item.title));
    const created = await Promise.all(
      unique.map((item) =>
        prisma.hotTopic.create({
          data: {
            userId: source.userId,
            operatingAccountId: source.operatingAccountId,
            sourceId: source.id,
            title: item.title,
            summary: item.summary,
            url: item.url,
            platform: item.platform,
            sourceName: item.sourceName,
            sourceType: item.sourceType,
            tags: item.tags || [],
            heatScore: item.rawHeatScore || 0,
            freshnessScore: item.publishedAt ? 80 : 40,
            rawMetrics: item.rawMetrics || {},
            rawData: item.rawData || {},
            collectedAt: new Date()
          } as any
        })
      )
    );
    await prisma.fetchJob.update({ where: { id: job.id }, data: { status: "success", finishedAt: new Date(), itemCount: created.length } });
    return { jobId: job.id, rawCount: raw.length, createdCount: created.length, items: created };
  } catch (error) {
    await prisma.fetchJob.update({ where: { id: job.id }, data: { status: "failed", finishedAt: new Date(), errorMessage: error instanceof Error ? error.message : "unknown" } });
    throw error;
  }
}
