export const dynamic = "force-dynamic";

import { apiError, ok } from "@/lib/api-utils";
import { getPersonaConversation } from "@/lib/workflows/persona-conversations";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await getPersonaConversation(params.id));
  } catch (error) {
    return apiError(error);
  }
}
