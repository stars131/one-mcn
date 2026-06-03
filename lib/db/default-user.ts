import { prisma } from "./prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function getDefaultUserId() {
  const currentUser = await getCurrentUser().catch(() => null);
  if (currentUser) return currentUser.id;

  const user = await prisma.user.upsert({
    where: { email: "demo@one-mcn.local" },
    update: {},
    create: { email: "demo@one-mcn.local", name: "Demo Creator" }
  });
  return user.id;
}
