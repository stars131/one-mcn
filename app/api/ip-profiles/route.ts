export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";
import { ipProfileSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    return ok(await prisma.ipProfile.findMany({ where: { userId, operatingAccountId }, orderBy: { createdAt: "desc" } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    const body = await readJson(request, ipProfileSchema);
    return ok(await prisma.ipProfile.create({ data: { userId, operatingAccountId, ...body } as any }));
  } catch (error) {
    return apiError(error);
  }
}
