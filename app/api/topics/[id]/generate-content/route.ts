export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { generateContentWorkflow } from "@/lib/workflows/ai-workflows";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await readJson(request, z.object({ platform: z.string(), contentType: z.string() }));
    return ok(await generateContentWorkflow({ topicId: params.id, ...body }));
  } catch (error) {
    return apiError(error);
  }
}
