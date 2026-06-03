export const dynamic = "force-dynamic";

import { apiError, ok } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return ok({ user: user ? { id: user.id, email: user.email, name: user.name } : null });
  } catch (error) {
    return apiError(error);
  }
}
