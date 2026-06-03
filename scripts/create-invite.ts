import crypto from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { hashSecret } from "@/lib/auth/session";

function arg(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const code = arg("code") || crypto.randomBytes(8).toString("base64url").toUpperCase();
  const maxUses = Number(arg("maxUses") || 1);
  const label = arg("label") || "Manual invite";
  const invite = await prisma.inviteCode.upsert({
    where: { codeHash: hashSecret(code) },
    update: { maxUses, label, disabledAt: null },
    create: { codeHash: hashSecret(code), maxUses, label }
  });
  console.log(JSON.stringify({ code, maxUses: invite.maxUses, label: invite.label }, null, 2));
}

main().finally(() => prisma.$disconnect());
