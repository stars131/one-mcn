export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";
import { ipProfileSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    return ok(await prisma.ipProfile.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    const body = await readJson(request, ipProfileSchema);
    return ok(await prisma.ipProfile.create({ data: { userId, ...body } as any }));
  } catch (error) {
    return apiError(error);
  }
}
