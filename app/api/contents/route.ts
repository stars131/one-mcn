export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";
import { contentSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    return ok(await prisma.content.findMany({ where: { userId, operatingAccountId }, orderBy: { createdAt: "desc" }, include: { topic: true, publishRecords: true, metrics: true } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    const body = await readJson(request, contentSchema);
    return ok(await prisma.content.create({ data: { userId, operatingAccountId, ...body } as any }));
  } catch (error) {
    return apiError(error);
  }
}
