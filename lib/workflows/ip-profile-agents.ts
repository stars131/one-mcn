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
  patch: IpProfileAgentPatch;
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

export async function collectIpProfileWithAgents(input: { currentProfile: unknown; note: string }): Promise<IpProfileAgentResult> {
  const result = await generateJson<IpProfileAgentResult>(
    [
      {
        role: "system",
        content:
          "你是个人 IP 定位总控 agent。你需要模拟 identity、audience、platform、value、monetization、boundary 六个 agent 协作，但只进行一次输出。必须帮助小白用户把零散表达整理为可保存资料。"
      },
      {
        role: "user",
        content: `根据当前资料和新输入，输出 JSON。不要编造过细事实；不确定时给 nextQuestions。平台只能从 platformOptions 中选择。

platformOptions:
${JSON.stringify(platformPromptContext())}

currentProfile:
${JSON.stringify(input.currentProfile)}

newUserInput:
${input.note}

输出格式：
{"agents":{"identity":{},"audience":{},"platform":{},"value":{},"monetization":{},"boundary":{}},"patch":{"name":"","niche":"","targetAudience":"","userPainPoints":[],"valueProposition":"","toneStyle":"","platforms":[],"monetizationGoals":[],"keywords":[],"competitors":[],"blockedTopics":[],"notes":[]},"nextQuestions":[]}`
      }
    ],
    { temperature: 0.2 }
  );

  return {
    agents: result.agents || {},
    patch: normalizePatch(result.patch || {}, input.note),
    nextQuestions: uniqueList(result.nextQuestions || []).slice(0, 6)
  };
}
