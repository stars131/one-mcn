export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { hotTopicSearchSchema } from "@/lib/validation/schemas";
import { searchHotTopicsWorkflow } from "@/lib/workflows/search-hot-topics";

export async function POST(request: Request) {
  try {
    const body = await readJson(request, hotTopicSearchSchema);
    return ok(await searchHotTopicsWorkflow(body));
  } catch (error) {
    return apiError(error);
  }
}
