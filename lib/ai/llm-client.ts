import { parseJsonOutput } from "./json-parser";

type Message = { role: "system" | "user" | "assistant"; content: string };

function providerConfig() {
  const provider = process.env.AI_PROVIDER || "openai";
  const apiKey = process.env.AI_API_KEY;
  const baseUrl =
    process.env.AI_BASE_URL ||
    (provider === "deepseek"
      ? "https://api.deepseek.com"
      : provider === "openrouter"
        ? "https://openrouter.ai/api/v1"
        : "https://api.openai.com/v1");
  const model = process.env.AI_MODEL || (provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini");
  if (!apiKey) throw new Error("缺少 AI_API_KEY，请在环境变量中配置 OpenAI/OpenRouter/DeepSeek API Key");
  return { provider, apiKey, baseUrl, model };
}

export async function generateText(messages: Message[], options?: { temperature?: number }) {
  const { apiKey, baseUrl, model } = providerConfig();
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.2
    })
  });
  if (!res.ok) throw new Error(`LLM 请求失败：${res.status} ${await res.text()}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("LLM 未返回 content");
  return String(content);
}

export async function generateJson<T>(messages: Message[], options?: { temperature?: number }) {
  const text = await generateText(
    [
      { role: "system", content: "你必须只输出可解析 JSON，不要输出 Markdown 或解释文字。" },
      ...messages
    ],
    options
  );
  return parseJsonOutput<T>(text);
}
