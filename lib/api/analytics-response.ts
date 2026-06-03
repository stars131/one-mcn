import { subDays } from "date-fns";
import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { calculateAnalyticsWorkflow } from "@/lib/workflows/analytics-workflows";

export async function analyticsPayload() {
  const userId = await getDefaultUserId();
  const operatingAccountId = await getCurrentOperatingAccountId(userId);
  const periodEnd = new Date();
  const periodStart = subDays(periodEnd, 30);
  return calculateAnalyticsWorkflow({ userId, operatingAccountId, periodStart, periodEnd });
}
