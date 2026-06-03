import { subDays } from "date-fns";
import { getDefaultUserId } from "@/lib/db/default-user";
import { calculateAnalyticsWorkflow } from "@/lib/workflows/analytics-workflows";

export async function analyticsPayload() {
  const userId = await getDefaultUserId();
  const periodEnd = new Date();
  const periodStart = subDays(periodEnd, 30);
  return calculateAnalyticsWorkflow({ userId, periodStart, periodEnd });
}
