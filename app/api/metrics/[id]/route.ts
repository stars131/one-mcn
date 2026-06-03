export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { prisma } from "@/lib/db/prisma";
import { metricSchema } from "@/lib/validation/schemas";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await readJson(request, metricSchema.partial());
    return ok(await prisma.contentMetric.update({ where: { id: params.id }, data: { ...body, collectedAt: body.collectedAt ? new Date(body.collectedAt) : undefined } as any }));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.contentMetric.delete({ where: { id: params.id } }));
  } catch (error) {
    return apiError(error);
  }
}
