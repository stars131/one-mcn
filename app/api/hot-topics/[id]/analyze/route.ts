export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { analyzeHotTopicWorkflow } from "@/lib/workflows/ai-workflows";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await readJson(request, z.object({ ipProfileId: z.string() }));
    return ok(await analyzeHotTopicWorkflow({ hotTopicId: params.id, ipProfileId: body.ipProfileId }));
  } catch (error) {
    return apiError(error);
  }
}
