export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { sendPersonaConversationMessage } from "@/lib/workflows/persona-conversations";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await readJson(request, z.object({ content: z.string().min(1) }));
    return ok(await sendPersonaConversationMessage({ conversationId: params.id, content: body.content }));
  } catch (error) {
    return apiError(error);
  }
}
