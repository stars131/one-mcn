export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { createPersonaConversation, listPersonaConversations } from "@/lib/workflows/persona-conversations";

export async function GET() {
  try {
    return ok(await listPersonaConversations());
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request, z.object({ title: z.string().optional(), ipProfileId: z.string().optional() }));
    return ok(await createPersonaConversation(body));
  } catch (error) {
    return apiError(error);
  }
}
