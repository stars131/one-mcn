import { requireCurrentUser } from "@/lib/auth/session";

export function isAdminEmail(email: string) {
  const admins = (process.env.ADMIN_EMAILS || "demo@one-mcn.local")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();
  if (!isAdminEmail(user.email)) throw new Error("需要管理员权限");
  return user;
}
