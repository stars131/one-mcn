export const dynamic = "force-dynamic";

import { z } from "zod";
import { apiError, ok, readJson } from "@/lib/api-utils";
import { ipProfileSchema } from "@/lib/validation/schemas";
import { collectIpProfileWithAgents } from "@/lib/workflows/ip-profile-agents";

const bodySchema = z.object({
  currentProfile: ipProfileSchema.partial().passthrough(),
  note: z.string().min(1),
  conversation: z.array(z.object({ role: z.enum(["assistant", "user"]), content: z.string() })).optional()
});

export async function POST(request: Request) {
  try {
    const body = await readJson(request, bodySchema);
    return ok(await collectIpProfileWithAgents(body));
  } catch (error) {
    return apiError(error);
  }
}
