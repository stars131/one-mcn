export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { prisma } from "@/lib/db/prisma";
import { sourceSchema } from "@/lib/validation/schemas";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.source.findUniqueOrThrow({ where: { id: params.id }, include: { items: { take: 20, orderBy: { createdAt: "desc" } }, fetchJobs: { take: 10, orderBy: { createdAt: "desc" } } } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await readJson(request, sourceSchema.partial());
    return ok(await prisma.source.update({ where: { id: params.id }, data: body as any }));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.source.delete({ where: { id: params.id } }));
  } catch (error) {
    return apiError(error);
  }
}
