import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export const OPERATING_ACCOUNT_COOKIE = "one_mcn_operating_account";

export async function ensureCurrentOperatingAccount(userId: string) {
  const selectedId = cookies().get(OPERATING_ACCOUNT_COOKIE)?.value;
  if (selectedId) {
    const selected = await prisma.operatingAccount.findFirst({ where: { id: selectedId, userId } });
    if (selected) return selected;
  }

  const first = await prisma.operatingAccount.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
  if (first) return first;

  return prisma.operatingAccount.create({
    data: {
      userId,
      name: "默认运营账号",
      platform: "综合",
      description: "默认承载当前用户的运营数据"
    }
  });
}

export async function getCurrentOperatingAccountId(userId: string) {
  return (await ensureCurrentOperatingAccount(userId)).id;
}

export function setCurrentOperatingAccountCookie(accountId: string) {
  cookies().set(OPERATING_ACCOUNT_COOKIE, accountId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
}
