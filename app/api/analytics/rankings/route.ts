export const dynamic = "force-dynamic";

import { apiError, ok } from "@/lib/api-utils";
import { analyticsPayload } from "@/lib/api/analytics-response";

export async function GET() {
  try {
    const data = await analyticsPayload();
    return ok({ top: data.top, worst: data.worst, highSave: data.highSave, highFollower: data.highFollower });
  } catch (error) {
    return apiError(error);
  }
}
