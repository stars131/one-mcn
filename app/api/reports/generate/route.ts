export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { generateReviewReportWorkflow } from "@/lib/workflows/analytics-workflows";
import { periodSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const body = await readJson(request, periodSchema);
    const userId = body.userId || (await getDefaultUserId());
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    return ok(await generateReviewReportWorkflow({ userId, operatingAccountId, periodStart: new Date(body.periodStart), periodEnd: new Date(body.periodEnd) }));
  } catch (error) {
    return apiError(error);
  }
}
