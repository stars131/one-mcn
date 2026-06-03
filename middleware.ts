import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

const protectedPrefixes = [
  "/dashboard",
  "/ip-profile",
  "/sources",
  "/hot-topics",
  "/topics",
  "/contents",
  "/calendar",
  "/analytics",
  "/reports",
  "/settings",
  "/admin"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
    if (hasSession) return NextResponse.next();
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!isProtected) return NextResponse.next();
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (hasSession) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
