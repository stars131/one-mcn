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
    const source = await prisma.source.upsert({
      where: { id: (await prisma.source.findFirst({ where: { userId, operatingAccountId, name: "免费热点接口" }, select: { id: true } }))?.id || "" },
      update: { url: settings.freeHotspotUrl, enabled: true, config: { tier: "free" } },
      create: { userId, operatingAccountId, name: "免费热点接口", type: "hot_feed", url: settings.freeHotspotUrl, config: { tier: "free" } }
    });
    return ok({ id: source.id, name: source.name, enabled: source.enabled });
  } catch (error) {
    return apiError(error);
  }
}
