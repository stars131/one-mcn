import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function readJson<T>(request: Request, schema: { parse: (value: unknown) => T }) {
  return schema.parse(await request.json());
}

export function ok(data: unknown) {
  return NextResponse.json(data);
}

export function apiError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ error: "输入校验失败", issues: error.issues }, { status: 400 });
  return NextResponse.json({ error: error instanceof Error ? error.message : "服务器错误" }, { status: 500 });
}
