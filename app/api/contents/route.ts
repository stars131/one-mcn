export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";
import { contentSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    return ok(await prisma.content.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { topic: true, publishRecords: true, metrics: true } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    const body = await readJson(request, contentSchema);
    return ok(await prisma.content.create({ data: { userId, ...body } as any }));
  } catch (error) {
    return apiError(error);
  }
}
