export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { requireAdminUser } from "@/lib/admin";
import { getHotspotSettings, saveHotspotSettings } from "@/lib/app-settings";

const hotspotSettingsSchema = z.object({
  freeHotspotUrl: z.string().url(),
  paidHotspotUrl: z.string().url(),
  paidDailyCost: z.number().int().nonnegative()
});

export async function GET() {
  try {
    await requireAdminUser();
    return ok(await getHotspotSettings());
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminUser();
    const body = await readJson(request, hotspotSettingsSchema);
    await saveHotspotSettings(body);
    return ok(body);
  } catch (error) {
    return apiError(error);
  }
}
