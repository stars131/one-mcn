export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { prisma } from "@/lib/db/prisma";
import { ipProfileSchema } from "@/lib/validation/schemas";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.ipProfile.update({ where: { id: params.id }, data: (await readJson(request, ipProfileSchema.partial())) as any }));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.ipProfile.delete({ where: { id: params.id } }));
  } catch (error) {
    return apiError(error);
  }
}
