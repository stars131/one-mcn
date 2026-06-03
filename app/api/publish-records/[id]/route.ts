export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { prisma } from "@/lib/db/prisma";
import { publishRecordSchema } from "@/lib/validation/schemas";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await readJson(request, publishRecordSchema.partial());
    return ok(await prisma.publishRecord.update({ where: { id: params.id }, data: { ...body, plannedAt: body.plannedAt ? new Date(body.plannedAt) : undefined, publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined } as any }));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.publishRecord.delete({ where: { id: params.id } }));
  } catch (error) {
    return apiError(error);
  }
}
