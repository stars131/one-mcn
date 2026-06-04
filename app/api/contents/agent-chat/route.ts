export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";

const contentAgentSchema = z.object({
  input: z.string().min(1),
  platform: z.string().default("小红书"),
  contentType: z.string().default("图文"),
  context: z.object({
    topicId: z.string().optional(),
    hotTopicId: z.string().optional(),
    ipProfileId: z.string().optional()
  }).optional(),
  conversation: z.array(z.object({ role: z.enum(["assistant", "user"]), content: z.string() })).default([])
});

function buildPreview(input: z.infer<typeof contentAgentSchema>) {
  const clean = input.input.trim();
  return {
    title: clean.length > 24 ? clean.slice(0, 24) : clean || "待生成内容标题",
    titles: [`${clean}：3个可执行切入点`, `为什么现在适合聊${clean}`, `${clean}的新手版本`],
    coverTexts: [`${clean}`, "先收藏再执行"],
    hook: `如果你最近也在关注“${clean}”，这条内容先帮你判断它值不值得跟。`,
    body: [
      `## 核心判断`,
      `围绕“${clean}”，先确认用户最关心的问题，再把热点转成一个明确观点。`,
      ``,
      `## 内容结构`,
      `1. 发生了什么`,
      `2. 为什么和目标用户有关`,
      `3. 可以怎么做`,
      `4. 下一步行动`,
      ``,
      `## 待细化`,
      `后续这里会接入真实内容 Agent，根据人设、热点、选题和平台规则生成完整初稿。`
    ].join("\n"),
    cta: "想要我继续拆成可发布版本，可以选择下一步生成完整初稿。",
    tags: [input.platform, input.contentType, clean].filter(Boolean),
    commentGuide: "你最想先看哪一类拆解？"
  };
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request, contentAgentSchema);
    return ok({
      assistantMessage: "我先把你的需求整理成一个可预览的内容骨架。下一步可以继续补充目标、语气或素材来源。",
      options: [
        { label: "更像小红书", value: "请把它调整成更适合小红书的表达。" },
        { label: "更专业", value: "请把它调整得更专业、结构更强。" },
        { label: "更口语", value: "请把它调整得更像真人口语分享。" },
        { label: "补充案例", value: "请加入一个具体案例再预览。" }
      ],
      draftPreview: buildPreview(body),
      completion: { score: 35, missing: ["真实生成策略", "平台细分规则", "完整素材引用"] }
    });
  } catch (error) {
    return apiError(error);
  }
}
