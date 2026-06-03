export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { generateContentWorkflow, generateTopicsWorkflow } from "@/lib/workflows/ai-workflows";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await readJson(request, z.object({ ipProfileId: z.string(), platform: z.string().default("小红书"), contentType: z.string().default("图文") }));
    const topics = await generateTopicsWorkflow({ hotTopicId: params.id, ipProfileId: body.ipProfileId });
    const firstTopic = topics[0];
    if (!firstTopic) throw new Error("没有生成可用选题");
    const content = await generateContentWorkflow({ topicId: firstTopic.id, platform: body.platform, contentType: body.contentType });
    return ok({ topic: firstTopic, content });
  } catch (error) {
    return apiError(error);
  }
}
