import { parseJsonOutput } from "./json-parser";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type Message = { role: "system" | "user" | "assistant"; content: string };
type ModelConfig = {
  mode: "server_credits" | "custom";
  provider: string;
  selectedConfigId?: string | null;
  apiKey?: string | null;
  baseUrl: string;
  textModel: string;
  multimodalModel: string;
  imageModel: string;
  credits?: number;
};

function serverModelConfig(): ModelConfig {
  const provider = process.env.AI_PROVIDER || "newapi";
  const apiKey = process.env.AI_API_KEY;
  const baseUrl =
    process.env.AI_BASE_URL ||
    (provider === "newapi"
      ? "https://elysiver.h-e.top"
      : provider === "deepseek"
      ? "https://api.deepseek.com"
      : provider === "openrouter"
        ? "https://openrouter.ai/api/v1"
        : "https://api.openai.com/v1");
  return {
    mode: "server_credits",
    provider,
    apiKey,
    baseUrl,
    textModel: process.env.AI_TEXT_MODEL || process.env.AI_MODEL || "deepseek-v4-pro",
    multimodalModel: process.env.AI_MULTIMODAL_MODEL || process.env.AI_TEXT_MODEL || "deepseek-v4-pro",
    imageModel: process.env.AI_IMAGE_MODEL || "deepseek-v4-pro"
  };
}

function chatCompletionsUrl(baseUrl: string) {
  const normalized = baseUrl.replace(/\/$/, "");
  return normalized.endsWith("/v1") ? `${normalized}/chat/completions` : `${normalized}/v1/chat/completions`;
}

export async function getModelConfig(): Promise<ModelConfig> {
  const server = serverModelConfig();
  const user = await getCurrentUser().catch(() => null);
  if (!user) return server;
  const preference = await prisma.userModelPreference.findUnique({ where: { userId: user.id } });
  if (preference?.mode === "custom") {
    const selected =
      (preference.selectedConfigId ? await prisma.userModelConfig.findFirst({ where: { id: preference.selectedConfigId, userId: user.id } }) : null) ||
      (await prisma.userModelConfig.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }));
    if (!selected) return { ...server, mode: "custom", apiKey: null, credits: user.aiCredits };
    return {
      mode: "custom",
      selectedConfigId: selected.id,
      provider: selected.textProvider,
      apiKey: selected.textApiKey,
      baseUrl: selected.textBaseUrl,
      textModel: selected.textModel,
      multimodalModel: selected.multimodalModel,
      imageModel: selected.imageModel,
      credits: user.aiCredits
    };
  }
  return { ...server, credits: user.aiCredits };
}

async function spendServerCredit() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return;
  const updated = await prisma.user.updateMany({ where: { id: user.id, aiCredits: { gt: 0 } }, data: { aiCredits: { decrement: 1 } } });
  if (!updated.count) throw new Error("AI 积分不足，请联系管理员充值或在设置页切换为自带 Key");
}

export async function generateText(messages: Message[], options?: { temperature?: number }) {
  const config = await getModelConfig();
  if (!config.apiKey) throw new Error("缺少 AI_API_KEY，请在环境变量或设置页配置模型 Key");
  if (config.mode === "server_credits") await spendServerCredit();
  const res = await fetch(chatCompletionsUrl(config.baseUrl), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.textModel,
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
