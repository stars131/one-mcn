export function parseJsonOutput<T>(text: string): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || trimmed;
  const firstObject = candidate.indexOf("{");
  const firstArray = candidate.indexOf("[");
  const start = [firstObject, firstArray].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  const jsonText = candidate.slice(start);
  try {
    return JSON.parse(jsonText) as T;
  } catch (error) {
    throw new Error(`AI JSON 解析失败：${error instanceof Error ? error.message : "unknown"}\n原始输出：${text.slice(0, 500)}`);
  }
}
