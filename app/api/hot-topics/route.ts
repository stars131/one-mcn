export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";
import { hotTopicSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    return ok(await prisma.hotTopic.findMany({ where: { userId }, orderBy: [{ recommendationScore: "desc" }, { collectedAt: "desc" }] }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    const body = await readJson(request, hotTopicSchema);
    return ok(await prisma.hotTopic.create({ data: { userId, ...body } as any }));
  } catch (error) {
    return apiError(error);
  }
}
