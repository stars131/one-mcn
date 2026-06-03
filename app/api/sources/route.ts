export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";
import { sourceSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    return ok(await prisma.source.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { fetchJobs: { orderBy: { createdAt: "desc" }, take: 1 } } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    const body = await readJson(request, sourceSchema);
    return ok(await prisma.source.create({ data: { userId, ...body, config: body.config || {} } as any }));
  } catch (error) {
    return apiError(error);
  }
}
