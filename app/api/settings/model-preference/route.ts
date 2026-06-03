export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const preferenceSchema = z.object({
  mode: z.enum(["server_credits", "custom"]),
  selectedConfigId: z.string().optional().nullable(),
  configs: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    provider: z.string().min(1).default("newapi"),
    baseUrl: z.string().min(1),
    textModel: z.string().min(1),
    multimodalModel: z.string().min(1),
    imageModel: z.string().min(1),
    apiKey: z.string().optional().nullable()
  })).default([])
});

export async function PUT(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = await readJson(request, preferenceSchema);
    const savedConfigs = [];
    if (body.mode === "custom") {
      const incomingIds = body.configs.map((config) => config.id).filter((id): id is string => Boolean(id));
      await prisma.userModelConfig.deleteMany({ where: { userId: user.id, id: { notIn: incomingIds.length ? incomingIds : [""] } } });
      for (const config of body.configs) {
        const existing = config.id ? await prisma.userModelConfig.findFirst({ where: { id: config.id, userId: user.id } }) : null;
        const data = {
          name: config.name,
          provider: config.provider,
          baseUrl: config.baseUrl,
          textModel: config.textModel,
          multimodalModel: config.multimodalModel,
          imageModel: config.imageModel,
          ...(config.apiKey ? { apiKey: config.apiKey } : {})
        };
        savedConfigs.push(
          existing
            ? await prisma.userModelConfig.update({ where: { id: existing.id }, data })
            : await prisma.userModelConfig.create({ data: { userId: user.id, ...data } })
        );
      }
    }
    const selectedConfigId =
      body.mode === "custom"
        ? savedConfigs.find((config) => config.id === body.selectedConfigId)?.id || savedConfigs[0]?.id || null
        : (await prisma.userModelPreference.findUnique({ where: { userId: user.id }, select: { selectedConfigId: true } }))?.selectedConfigId || null;
    const preference = await prisma.userModelPreference.upsert({
      where: { userId: user.id },
      update: { mode: body.mode, selectedConfigId },
      create: { userId: user.id, mode: body.mode, selectedConfigId }
    });
    return ok({ preference, configs: savedConfigs.map((config) => ({ ...config, apiKey: config.apiKey ? "configured" : null })) });
  } catch (error) {
    return apiError(error);
  }
}
