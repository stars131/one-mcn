export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { prisma } from "@/lib/db/prisma";
import { contentSchema } from "@/lib/validation/schemas";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.content.findUniqueOrThrow({ where: { id: params.id }, include: { topic: true, publishRecords: true, metrics: true } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await readJson(request, contentSchema.partial());
    return ok(await prisma.content.update({ where: { id: params.id }, data: body as any }));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.content.delete({ where: { id: params.id } }));
  } catch (error) {
    return apiError(error);
  }
}
