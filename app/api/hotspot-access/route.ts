export const dynamic = "force-dynamic";

import { apiError, ok } from "@/lib/api-utils";
import { getHotspotSettings } from "@/lib/app-settings";
import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    const settings = await getHotspotSettings();
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { aiCredits: true } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [freeSource, paidSource] = await Promise.all([
      prisma.source.findFirst({ where: { userId, name: "免费热点接口" } }),
      prisma.source.findFirst({ where: { userId, name: "付费热点接口（今日）", enabled: true, createdAt: { gte: today } }, orderBy: { createdAt: "desc" } })
    ]);
    return ok({
      credits: user.aiCredits,
      paidDailyCost: settings.paidDailyCost,
      freeEnabled: Boolean(freeSource),
      paidEnabled: Boolean(paidSource)
    });
  } catch (error) {
    return apiError(error);
  }
}
