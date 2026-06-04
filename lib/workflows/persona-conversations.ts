import { getCurrentOperatingAccountId } from "@/lib/accounts/current-account";
import { getDefaultUserId } from "@/lib/db/default-user";
import { prisma } from "@/lib/db/prisma";
import { collectIpProfileWithAgents } from "@/lib/workflows/ip-profile-agents";

type IpProfileShape = {
  id: string;
  name: string;
  niche: string;
  targetAudience: string;
  userPainPoints: string[];
  valueProposition: string;
  toneStyle: string;
  platforms: string[];
  monetizationGoals: string[];
  keywords: string[];
  competitors: string[];
  blockedTopics: string[];
  notes: string[];
};

function asArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function uniqueList(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function emptyProfile(): Omit<IpProfileShape, "id"> {
  return {
    name: "小八的人设",
    niche: "",
    targetAudience: "",
    userPainPoints: [],
    valueProposition: "",
    toneStyle: "专业、清晰、可执行",
    platforms: [],
    monetizationGoals: [],
    keywords: [],
    competitors: [],
    blockedTopics: [],
    notes: []
  };
}

function normalizeProfile(item: any): IpProfileShape {
  return {
    id: item.id,
    ...emptyProfile(),
    ...item,
    userPainPoints: asArray(item.userPainPoints),
    platforms: asArray(item.platforms),
    monetizationGoals: asArray(item.monetizationGoals),
    keywords: asArray(item.keywords),
    competitors: asArray(item.competitors),
    blockedTopics: asArray(item.blockedTopics),
    notes: asArray(item.notes)
  };
}

function profilePayload(profile: IpProfileShape) {
  const { id, ...payload } = profile;
  return payload;
}

function mergeProfile(current: IpProfileShape, patch: Partial<IpProfileShape>, userInput: string) {
  return {
    ...current,
    ...patch,
    userPainPoints: uniqueList([...(current.userPainPoints || []), ...asArray(patch.userPainPoints)]),
    platforms: uniqueList([...(current.platforms || []), ...asArray(patch.platforms)]),
    monetizationGoals: uniqueList([...(current.monetizationGoals || []), ...asArray(patch.monetizationGoals)]),
    keywords: uniqueList([...(current.keywords || []), ...asArray(patch.keywords)]).slice(0, 24),
    competitors: uniqueList([...(current.competitors || []), ...asArray(patch.competitors)]),
    blockedTopics: uniqueList([...(current.blockedTopics || []), ...asArray(patch.blockedTopics)]),
    notes: uniqueList([`用户选择：${userInput}`, ...asArray(patch.notes), ...current.notes]).slice(0, 30)
  };
}

export async function listPersonaConversations() {
  const userId = await getDefaultUserId();
  const operatingAccountId = await getCurrentOperatingAccountId(userId);
  return prisma.personaConversation.findMany({
    where: { userId, operatingAccountId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
}

export async function createPersonaConversation(input?: { title?: string; ipProfileId?: string }) {
  const userId = await getDefaultUserId();
  const operatingAccountId = await getCurrentOperatingAccountId(userId);
  let ipProfileId = input?.ipProfileId;
  if (!ipProfileId) {
    const profile = await prisma.ipProfile.create({
      data: { userId, operatingAccountId, ...emptyProfile() } as any
    });
    ipProfileId = profile.id;
  }
  return prisma.personaConversation.create({
    data: {
      userId,
      operatingAccountId,
      ipProfileId,
      title: input?.title?.trim() || "新的人设对话",
      currentPrompt: "我们先从一个方向开始。你可以选择从零开始、已有账号、先定平台或先找变现。"
    },
    include: { messages: { orderBy: { createdAt: "asc" } }, ipProfile: true }
  });
}

export async function getPersonaConversation(conversationId: string) {
  const userId = await getDefaultUserId();
  const operatingAccountId = await getCurrentOperatingAccountId(userId);
  return prisma.personaConversation.findFirstOrThrow({
    where: { id: conversationId, userId, operatingAccountId },
    include: { messages: { orderBy: { createdAt: "asc" } }, ipProfile: true }
  });
}

export async function sendPersonaConversationMessage(input: { conversationId: string; content: string }) {
  const userId = await getDefaultUserId();
  const operatingAccountId = await getCurrentOperatingAccountId(userId);
  const conversation = await prisma.personaConversation.findFirstOrThrow({
    where: { id: input.conversationId, userId, operatingAccountId },
    include: { messages: { orderBy: { createdAt: "asc" } }, ipProfile: true }
  });
  const profile = conversation.ipProfile
    ? normalizeProfile(conversation.ipProfile)
    : normalizeProfile(await prisma.ipProfile.create({ data: { userId, operatingAccountId, ...emptyProfile() } as any }));

  if (!conversation.ipProfileId) {
    await prisma.personaConversation.update({ where: { id: conversation.id }, data: { ipProfileId: profile.id } });
  }

  const history = conversation.messages.map((message) => ({ role: message.role as "assistant" | "user", content: message.content }));
  const agentData = await collectIpProfileWithAgents({
    currentProfile: profilePayload(profile),
    note: input.content,
    conversation: [...history, { role: "user", content: input.content }]
  });
  const nextProfile = mergeProfile(profile, agentData.patch || {}, input.content);
  const savedProfile = await prisma.ipProfile.update({
    where: { id: profile.id },
    data: profilePayload(nextProfile) as any
  });

  const [userMessage, assistantMessage] = await prisma.$transaction([
    prisma.personaMessage.create({
      data: {
        userId,
        operatingAccountId,
        conversationId: conversation.id,
        role: "user",
        content: input.content
      }
    }),
    prisma.personaMessage.create({
      data: {
        userId,
        operatingAccountId,
        conversationId: conversation.id,
        role: "assistant",
        content: agentData.assistantMessage || "我已记录。我们继续补齐下一块人设信息。",
        patch: (agentData.patch || {}) as any,
        options: (agentData.options || []) as any
      }
    })
  ]);

  const title = conversation.title === "新的人设对话" ? input.content.slice(0, 18) || conversation.title : conversation.title;
  const updated = await prisma.personaConversation.update({
    where: { id: conversation.id },
    data: {
      title,
      lastUserAnswer: input.content,
      lastAssistantReply: assistantMessage.content,
      currentPrompt: assistantMessage.content,
      options: (agentData.options || []) as any,
      completion: (agentData.completion || {}) as any,
      ipProfileId: profile.id
    },
    include: { messages: { orderBy: { createdAt: "asc" } }, ipProfile: true }
  });

  return { conversation: updated, userMessage, assistantMessage, ipProfile: savedProfile };
}
