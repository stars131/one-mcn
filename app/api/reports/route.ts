export const dynamic = "force-dynamic";

import { apiError, ok } from "@/lib/api-utils";
import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    return ok(await prisma.reviewReport.findMany({ where: { userId, operatingAccountId }, orderBy: { createdAt: "desc" } }));
  } catch (error) {
    return apiError(error);
  }
}
