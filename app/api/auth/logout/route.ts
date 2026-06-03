export const dynamic = "force-dynamic";

import { apiError, ok } from "@/lib/api-utils";
import { clearAuthSession } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearAuthSession();
    return ok({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
