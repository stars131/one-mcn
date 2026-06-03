export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";
import { hotTopicSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    return ok(await prisma.hotTopic.findMany({ where: { userId, operatingAccountId }, orderBy: [{ recommendationScore: "desc" }, { collectedAt: "desc" }] }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    const body = await readJson(request, hotTopicSchema);
    return ok(await prisma.hotTopic.create({ data: { userId, operatingAccountId, ...body } as any }));
  } catch (error) {
    return apiError(error);
  }
}
