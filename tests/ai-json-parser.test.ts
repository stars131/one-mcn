import { describe, expect, it } from "vitest";
import { parseJsonOutput } from "@/lib/ai/json-parser";

describe("parseJsonOutput", () => {
  it("parses plain json", () => {
    expect(parseJsonOutput<{ ok: boolean }>('{"ok":true}')).toEqual({ ok: true });
  });

  it("parses fenced json", () => {
    expect(parseJsonOutput<{ score: number }>("```json\n{\"score\":88}\n```")).toEqual({ score: 88 });
  });

  it("throws a useful error on invalid json", () => {
    expect(() => parseJsonOutput("not json")).toThrow("AI JSON 解析失败");
  });
});
