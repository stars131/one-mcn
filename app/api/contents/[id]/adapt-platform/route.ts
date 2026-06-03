export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { adaptContentWorkflow } from "@/lib/workflows/ai-workflows";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await readJson(request, z.object({ targetPlatform: z.string() }));
    return ok(await adaptContentWorkflow({ contentId: params.id, targetPlatform: body.targetPlatform }));
  } catch (error) {
    return apiError(error);
  }
}
