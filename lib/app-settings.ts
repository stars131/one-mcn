import { prisma } from "@/lib/db/prisma";

export type HotspotSettings = {
  freeHotspotUrl: string;
  paidHotspotUrl: string;
  paidDailyCost: number;
};

const defaultHotspotSettings: HotspotSettings = {
  freeHotspotUrl: "http://127.0.0.1:4100/api/hot-topics?source=github&limit=10",
  paidHotspotUrl: "http://127.0.0.1:4100/api/hot-topics?source=github&limit=50",
  paidDailyCost: 20
};

export async function getHotspotSettings(): Promise<HotspotSettings> {
  const setting = await prisma.appSetting.findUnique({ where: { key: "hotspot_access" } });
  return { ...defaultHotspotSettings, ...((setting?.value as Partial<HotspotSettings>) || {}) };
}

export async function saveHotspotSettings(value: HotspotSettings) {
  return prisma.appSetting.upsert({
    where: { key: "hotspot_access" },
    update: { value },
    create: { key: "hotspot_access", value }
  });
}
