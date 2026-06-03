export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { prisma } from "@/lib/db/prisma";
import { hotTopicSchema } from "@/lib/validation/schemas";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.hotTopic.findUniqueOrThrow({ where: { id: params.id }, include: { topics: true } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.hotTopic.update({ where: { id: params.id }, data: (await readJson(request, hotTopicSchema.partial())) as any }));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.hotTopic.delete({ where: { id: params.id } }));
  } catch (error) {
    return apiError(error);
  }
}
