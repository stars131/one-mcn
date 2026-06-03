export const dynamic = "force-dynamic";

import { apiError, ok } from "@/lib/api-utils";
import { analyticsPayload } from "@/lib/api/analytics-response";

export async function GET() {
  try {
    const data = await analyticsPayload();
    return ok({ totals: data.totals, rates: data.rates, snapshot: data.snapshot });
  } catch (error) {
    return apiError(error);
  }
}
