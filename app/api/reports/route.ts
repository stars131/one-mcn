export const dynamic = "force-dynamic";

import { apiError, ok } from "@/lib/api-utils";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    return ok(await prisma.reviewReport.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }));
  } catch (error) {
    return apiError(error);
  }
}
