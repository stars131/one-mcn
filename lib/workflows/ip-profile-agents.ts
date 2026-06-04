import { generateJson } from "@/lib/ai/llm-client";
import { platformLabels, platformPromptContext } from "@/lib/platforms/registry";

export type IpProfileAgentPatch = {
  name?: string;
  niche?: string;
  targetAudience?: string;
  userPainPoints?: string[];
  valueProposition?: string;
  toneStyle?: string;
  platforms?: string[];
  monetizationGoals?: string[];
  keywords?: string[];
  competitors?: string[];
  blockedTopics?: string[];
  notes?: string[];
};

export type IpProfileAgentResult = {
  agents?: {
    identity?: Record<string, unknown>;
    audience?: Record<string, unknown>;
    platform?: Record<string, unknown>;
    value?: Record<string, unknown>;
    monetization?: Record<string, unknown>;
    boundary?: Record<string, unknown>;
  };
  assistantMessage?: string;
  options?: { label: string; value: string; description?: string }[];
  patch: IpProfileAgentPatch;
  completion?: { score?: number; missing?: string[] };
  nextQuestions?: string[];
};

function uniqueList(items: unknown[], allowed?: string[]) {
  const strings = items.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  const filtered = allowed ? strings.filter((item) => allowed.includes(item)) : strings;
  return Array.from(new Set(filtered));
}

function normalizePatch(patch: IpProfileAgentPatch, note: string): IpProfileAgentPatch {
  return {
    ...patch,
    userPainPoints: uniqueList(patch.userPainPoints || []),
    platforms: uniqueList(patch.platforms || [], platformLabels),
    monetizationGoals: uniqueList(patch.monetizationGoals || []),
    keywords: uniqueList(patch.keywords || []).slice(0, 24),
    competitors: uniqueList(patch.competitors || []),
    blockedTopics: uniqueList(patch.blockedTopics || []),
    notes: uniqueList([note, ...(patch.notes || [])]).slice(0, 20)
  };
}

function normalizeOptions(options: unknown[]) {
  return options
    .map((item) => {
      if (typeof item === "string") return { label: item, value: item };
      if (!item || typeof item !== "object") return null;
      const option = item as Record<string, unknown>;
      const label = typeof option.label === "string" ? option.label.trim() : "";
      const value = typeof option.value === "string" ? option.value.trim() : label;
      const description = typeof option.description === "string" ? option.description.trim() : undefined;
      return label && value ? { label, value, description } : null;
    })
    .filter((item): item is { label: string; value: string; description?: string } => Boolean(item))
    .slice(0, 5);
}

export async function collectIpProfileWithAgents(input: { currentProfile: unknown; note: string; conversation?: unknown[] }): Promise<IpProfileAgentResult> {
  const result = await generateJson<IpProfileAgentResult>(
    [
      {
        role: "system",
        content:
          "你是“人设确定 Agent”，不是表单解析器。你的目标是像 GPT 对话一样逐轮帮助小白确定人设：每轮只推进一个关键问题，给出 3-5 个可选择答案，也允许用户自由补充。必须调用已有上下文，不重复问已明确的信息。"
      },
      {
        role: "user",
        content: `根据当前人设资料、历史对话和用户最新回复，输出下一轮对话 JSON。不要编造过细事实；不确定时用 options 引导用户选择。平台只能从 platformOptions 中选择。

platformOptions:
${JSON.stringify(platformPromptContext())}

currentPersona:
${JSON.stringify(input.currentProfile)}

conversation:
${JSON.stringify(input.conversation || [])}

newUserInput:
${input.note}

规则：
1. assistantMessage 要像真人助手，先承接用户回答，再提出下一步问题。
2. options 是用户下一步可点击的选项，每个选项都必须能直接作为用户回复继续对话。
3. patch 只写可以从上下文合理得出的字段；数组字段要累积，不要覆盖掉已有价值信息。
4. 如果关键字段已经较完整，可以给“采用当前人设初稿”“更专业”“更真实口语”“更适合小红书/抖音/公众号”等选项。
5. notes 要包含本轮用户选择或输入的简短事实，便于长期沉淀。

输出格式：
{"assistantMessage":"","options":[{"label":"","value":"","description":""}],"agents":{"identity":{},"audience":{},"platform":{},"value":{},"monetization":{},"boundary":{}},"patch":{"name":"","niche":"","targetAudience":"","userPainPoints":[],"valueProposition":"","toneStyle":"","platforms":[],"monetizationGoals":[],"keywords":[],"competitors":[],"blockedTopics":[],"notes":[]},"completion":{"score":0,"missing":[]},"nextQuestions":[]}`
      }
    ],
    { temperature: 0.2 }
  );

  return {
    agents: result.agents || {},
    assistantMessage: result.assistantMessage || "我已经记录这一轮信息。下一步我们继续补齐人设的关键部分。",
    options: normalizeOptions(result.options || result.nextQuestions || []),
    patch: normalizePatch(result.patch || {}, input.note),
    completion: {
      score: Math.max(0, Math.min(100, Number(result.completion?.score || 0))),
      missing: uniqueList(result.completion?.missing || []).slice(0, 6)
    },
    nextQuestions: uniqueList(result.nextQuestions || []).slice(0, 6)
  };
}
