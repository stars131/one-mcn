export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { prisma } from "@/lib/db/prisma";
import { consumeInviteCode, validateInviteCode } from "@/lib/auth/invite";
import { createAuthSession, normalizeEmail } from "@/lib/auth/session";

const registerSchema = z.object({
  email: z.string().email(),
  inviteCode: z.string().min(4),
  name: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await readJson(request, registerSchema);
    const email = normalizeEmail(body.email);
    await validateInviteCode(body.inviteCode);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.activatedAt) throw new Error("该邮箱已注册，请直接登录");
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: body.name || undefined, activatedAt: new Date() },
      create: { email, name: body.name, activatedAt: new Date() }
    });
    await consumeInviteCode(body.inviteCode);
    await createAuthSession(user.id);
    return ok({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    return apiError(error);
  }
}
