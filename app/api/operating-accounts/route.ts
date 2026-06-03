export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { ensureCurrentOperatingAccount } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";

const accountSchema = z.object({
  name: z.string().min(1, "账号名称不能为空"),
  platform: z.string().optional().nullable(),
  handle: z.string().optional().nullable(),
  description: z.string().optional().nullable()
});

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const current = await ensureCurrentOperatingAccount(userId);
    const accounts = await prisma.operatingAccount.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
    return ok({ currentId: current.id, accounts });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    const body = await readJson(request, accountSchema);
    return ok(await prisma.operatingAccount.create({ data: { userId, ...body } }));
  } catch (error) {
    return apiError(error);
  }
}
