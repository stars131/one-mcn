export const dynamic = "force-dynamic";

import { apiError, ok } from "@/lib/api-utils";
import { prisma } from "@/lib/db/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.reviewReport.findUniqueOrThrow({ where: { id: params.id } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.reviewReport.delete({ where: { id: params.id } }));
  } catch (error) {
    return apiError(error);
  }
}
