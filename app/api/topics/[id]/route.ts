export const dynamic = "force-dynamic";

import { apiError, ok, readJson } from "@/lib/api-utils";
import { prisma } from "@/lib/db/prisma";
import { topicSchema } from "@/lib/validation/schemas";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.topic.findUniqueOrThrow({ where: { id: params.id }, include: { contents: true, hotTopic: true } }));
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.topic.update({ where: { id: params.id }, data: (await readJson(request, topicSchema.partial())) as any }));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await prisma.topic.delete({ where: { id: params.id } }));
  } catch (error) {
    return apiError(error);
  }
}
