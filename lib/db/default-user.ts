import { prisma } from "./prisma";

export async function getDefaultUserId() {
  const user = await prisma.user.upsert({
    where: { email: "demo@one-mcn.local" },
    update: {},
    create: { email: "demo@one-mcn.local", name: "Demo Creator" }
  });
  return user.id;
}
