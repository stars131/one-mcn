export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";
import { metricSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    return ok(await prisma.contentMetric.findMany({ where: { userId, operatingAccountId }, orderBy: { collectedAt: "desc" }, include: { content: true } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    const body = await readJson(request, metricSchema);
    return ok(await prisma.contentMetric.create({ data: { userId, operatingAccountId, ...body, collectedAt: body.collectedAt ? new Date(body.collectedAt) : new Date() } as any }));
  } catch (error) {
    return apiError(error);
  }
}
