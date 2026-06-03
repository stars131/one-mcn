export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";
import { sourceSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    return ok(await prisma.source.findMany({ where: { userId, operatingAccountId }, orderBy: { createdAt: "desc" }, include: { fetchJobs: { orderBy: { createdAt: "desc" }, take: 1 } } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    const body = await readJson(request, sourceSchema);
    return ok(await prisma.source.create({ data: { userId, operatingAccountId, ...body, config: body.config || {} } as any }));
  } catch (error) {
    return apiError(error);
  }
}
