export const dynamic = "force-dynamic";

import { apiError, ok } from "@/lib/api-utils";
import { analyticsPayload } from "@/lib/api/analytics-response";

export async function GET() {
  try {
    return ok((await analyticsPayload()).platformAgg);
  } catch (error) {
    return apiError(error);
  }
}
