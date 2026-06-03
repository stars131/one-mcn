export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { validateInviteCodeForLogin } from "@/lib/auth/invite";
import { createAuthSession, normalizeEmail } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  inviteCode: z.string().min(4)
});

export async function POST(request: Request) {
  try {
    const body = await readJson(request, loginSchema);
    await validateInviteCodeForLogin(body.inviteCode);
    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(body.email) } });
    if (!user?.activatedAt) throw new Error("该邮箱尚未注册，请先注册");
    await createAuthSession(user.id);
    return ok({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    return apiError(error);
  }
}
