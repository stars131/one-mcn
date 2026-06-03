export const dynamic = "force-dynamic";

import { apiError, ok } from "@/lib/api-utils";
import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getHotspotSettings } from "@/lib/app-settings";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  try {
    const userId = await getDefaultUserId();
    const operatingAccountId = await getCurrentOperatingAccountId(userId);
    const settings = await getHotspotSettings();
    const charged = await prisma.user.updateMany({ where: { id: userId, aiCredits: { gte: settings.paidDailyCost } }, data: { aiCredits: { decrement: settings.paidDailyCost } } });
    if (!charged.count) throw new Error("积分不足");
    const source = await prisma.source.create({
      data: { userId, operatingAccountId, name: "付费热点接口（今日）", type: "hot_feed", url: settings.paidHotspotUrl, config: { tier: "paid_daily", purchasedAt: new Date().toISOString(), cost: settings.paidDailyCost } }
    });
    return ok({ id: source.id, name: source.name, cost: settings.paidDailyCost });
  } catch (error) {
    return apiError(error);
  }
}
