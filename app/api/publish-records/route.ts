export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";
import { publishRecordSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    return ok(await prisma.publishRecord.findMany({ where: { userId, operatingAccountId }, orderBy: { plannedAt: "asc" }, include: { content: true } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    const body = await readJson(request, publishRecordSchema);
    return ok(await prisma.publishRecord.create({ data: { userId, operatingAccountId, ...body, plannedAt: body.plannedAt ? new Date(body.plannedAt) : undefined, publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined } as any }));
  } catch (error) {
    return apiError(error);
  }
}
