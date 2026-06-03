export const dynamic = "force-dynamic";

import { apiError, ok } from "@/lib/api-utils";
import { analyticsPayload } from "@/lib/api/analytics-response";

export async function GET() {
  try {
    const data = await analyticsPayload();
    return ok({ trends7: data.trends7, trends30: data.trends30 });
  } catch (error) {
    return apiError(error);
  }
}
