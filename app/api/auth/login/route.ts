export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { createAuthSession, normalizeEmail } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = await readJson(request, loginSchema);
    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(body.email) } });
    if (!user?.activatedAt) throw new Error("该邮箱尚未注册，请先注册");
    if (!verifyPassword(body.password, user.passwordHash)) throw new Error("邮箱或密码错误");
    await createAuthSession(user.id);
    return ok({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    return apiError(error);
  }
}
