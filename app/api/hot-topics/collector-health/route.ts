export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { DEFAULT_HOTSPOT_AGENT_BASE_URL } from "@/lib/workflows/search-hot-topics";

export async function GET() {
  const baseUrl = (process.env.HOTSPOT_AGENT_BASE_URL || DEFAULT_HOTSPOT_AGENT_BASE_URL).replace(/\/$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({
      ok: res.ok && data?.ok === true,
      baseUrl,
      source: "wlwl-hotspot-collector",
      mode: res.ok && data?.ok === true ? "external" : "local_fallback"
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      baseUrl,
      source: "wlwl-hotspot-collector",
      mode: "local_fallback",
      error: error instanceof Error ? error.message : "热点搜集工具不可用"
    });
  } finally {
    clearTimeout(timer);
  }
}
