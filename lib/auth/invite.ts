import { prisma } from "@/lib/db/prisma";
import { hashSecret } from "./session";

export async function validateInviteCode(code: string) {
  const invite = await prisma.inviteCode.findUnique({ where: { codeHash: hashSecret(code) } });
  if (!invite) throw new Error("邀请码无效");
  if (invite.disabledAt) throw new Error("邀请码已停用");
  if (invite.expiresAt && invite.expiresAt < new Date()) throw new Error("邀请码已过期");
  if (invite.usedCount >= invite.maxUses) throw new Error("邀请码使用次数已满");
  return invite;
}

export async function validateInviteCodeForLogin(code: string) {
  const invite = await prisma.inviteCode.findUnique({ where: { codeHash: hashSecret(code) } });
  if (!invite) throw new Error("邀请码无效");
  if (invite.disabledAt) throw new Error("邀请码已停用");
  if (invite.expiresAt && invite.expiresAt < new Date()) throw new Error("邀请码已过期");
  return invite;
}

export async function consumeInviteCode(code: string) {
  const invite = await validateInviteCode(code);
  await prisma.inviteCode.update({
    where: { id: invite.id },
    data: { usedCount: { increment: 1 } }
  });
}

export async function ensureBootstrapInvite() {
  const code = process.env.INITIAL_INVITE_CODE || "ONE-MCN-2026";
  await prisma.inviteCode.upsert({
    where: { codeHash: hashSecret(code) },
    update: {},
    create: {
      codeHash: hashSecret(code),
      label: "Bootstrap invite",
      maxUses: 100
    }
  });
  return code;
}
