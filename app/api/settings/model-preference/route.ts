export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const preferenceSchema = z.object({
  mode: z.enum(["server_credits", "custom"]),
  provider: z.string().min(1).default("newapi"),
  baseUrl: z.string().optional().nullable(),
  textModel: z.string().optional().nullable(),
  multimodalModel: z.string().optional().nullable(),
  imageModel: z.string().optional().nullable(),
  apiKey: z.string().optional().nullable()
});

export async function PUT(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = await readJson(request, preferenceSchema);
    const data = {
      mode: body.mode,
      provider: body.provider,
      baseUrl: body.baseUrl || null,
      textModel: body.textModel || null,
      multimodalModel: body.multimodalModel || null,
      imageModel: body.imageModel || null,
      ...(body.apiKey ? { apiKey: body.apiKey } : {})
    };
    const preference = await prisma.userModelPreference.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data }
    });
    return ok({ ...preference, apiKey: preference.apiKey ? "configured" : null });
  } catch (error) {
    return apiError(error);
  }
}
