import { z } from "zod";

export const idParams = z.object({ id: z.string().min(1) });
export const periodSchema = z.object({ userId: z.string().optional(), periodStart: z.string(), periodEnd: z.string() });
export const sourceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["github", "rss", "api_json", "manual", "webpage"]),
  url: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  config: z.record(z.unknown()).optional()
});
export const fetchSourceSchema = z.object({
  keywords: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(50).optional(),
  timeRange: z.enum(["day", "week", "month"]).optional(),
  language: z.string().optional(),
  manualItems: z.array(z.any()).optional()
});
export const ipProfileSchema = z.object({
  name: z.string().min(1),
  niche: z.string().default(""),
  targetAudience: z.string().default(""),
  userPainPoints: z.array(z.string()).default([]),
  valueProposition: z.string().default(""),
  toneStyle: z.string().default("专业、清晰、可执行"),
  platforms: z.array(z.string()).default([]),
  monetizationGoals: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  competitors: z.array(z.string()).default([]),
  blockedTopics: z.array(z.string()).default([])
});
export const hotTopicSchema = z.object({ title: z.string().min(1), summary: z.string().optional(), url: z.string().optional(), platform: z.string().optional(), sourceName: z.string().default("Manual"), sourceType: z.enum(["github", "rss", "api_json", "manual", "webpage"]).default("manual"), tags: z.array(z.string()).default([]) });
export const topicSchema = z.object({ ipProfileId: z.string().optional(), hotTopicId: z.string().optional(), title: z.string().min(1), corePoint: z.string().default(""), targetAudience: z.string().default(""), userPainPoint: z.string().default(""), platform: z.string().default("小红书"), contentType: z.string().default("图文"), status: z.string().optional(), trafficScore: z.number().optional(), businessScore: z.number().optional(), difficultyScore: z.number().optional(), reason: z.string().optional(), outline: z.array(z.unknown()).default([]) });
export const contentSchema = z.object({ topicId: z.string().optional().nullable(), platform: z.string(), contentType: z.string(), title: z.string().min(1), titles: z.array(z.string()).default([]), coverTexts: z.array(z.string()).default([]), hook: z.string().optional(), body: z.string().default(""), cta: z.string().optional(), tags: z.array(z.string()).default([]), commentGuide: z.string().optional(), status: z.string().optional() });
export const publishRecordSchema = z.object({ contentId: z.string(), platform: z.string(), plannedAt: z.string().optional().nullable(), publishedAt: z.string().optional().nullable(), publishedUrl: z.string().optional().nullable(), status: z.string().optional() });
export const metricSchema = z.object({ contentId: z.string(), platform: z.string(), views: z.number().int().default(0), likes: z.number().int().default(0), comments: z.number().int().default(0), saves: z.number().int().default(0), shares: z.number().int().default(0), followersGained: z.number().int().default(0), completionRate: z.number().default(0), clickRate: z.number().default(0), avgWatchTime: z.number().default(0), impressions: z.number().int().default(0), collectedAt: z.string().optional() });
