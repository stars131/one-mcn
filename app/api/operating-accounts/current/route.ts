export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { setCurrentOperatingAccountCookie } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";

const currentAccountSchema = z.object({ accountId: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId();
    const body = await readJson(request, currentAccountSchema);
    const account = await prisma.operatingAccount.findFirstOrThrow({ where: { id: body.accountId, userId } });
    setCurrentOperatingAccountCookie(account.id);
    return ok({ currentId: account.id });
  } catch (error) {
    return apiError(error);
  }
}
