export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";
import { topicSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    return ok(await prisma.topic.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { hotTopic: true } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    return ok(await prisma.topic.create({ data: { userId, ...(await readJson(request, topicSchema)) } as any }));
  } catch (error) {
    return apiError(error);
  }
}
