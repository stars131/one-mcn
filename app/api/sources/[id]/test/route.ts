export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { collectHotTopicsWorkflow } from "@/lib/workflows/collect-hot-topics";
import { fetchSourceSchema } from "@/lib/validation/schemas";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await readJson(request, fetchSourceSchema.partial());
    const result = await collectHotTopicsWorkflow({ sourceId: params.id, limit: 3, ...body });
    return ok({ ok: true, result });
  } catch (error) {
    return apiError(error);
  }
}
