import { Card, CardTitle } from "@/components/ui/card";
import { getModelConfig } from "@/lib/ai/llm-client";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ModelSettingsForm } from "@/components/model-settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const config = await getModelConfig();
  const user = await getCurrentUser();
  const preference = user ? await prisma.userModelPreference.findUnique({ where: { userId: user.id } }) : null;
  const configs = user ? await prisma.userModelConfig.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }) : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">系统设置</h1>
        <p className="mt-1 text-sm text-muted-foreground">配置 AI Provider、语言模型、多模态模型、生图模型、默认平台和采集频率。生产环境建议使用环境变量和密钥管理。</p>
      </div>
      <Card>
        <CardTitle>AI 模型配置</CardTitle>
        <div className="mt-4">
          <ModelSettingsForm
            initial={{
              mode: config.mode,
              selectedConfigId: preference?.selectedConfigId || config.selectedConfigId,
              credits: config.credits,
              configs: configs.map((item) => ({
                id: item.id,
                name: item.name,
                provider: item.provider,
                baseUrl: item.baseUrl,
                textModel: item.textModel,
                multimodalModel: item.multimodalModel,
                imageModel: item.imageModel,
                hasKey: Boolean(item.apiKey)
              }))
            }}
          />
        </div>
      </Card>
    </div>
  );
}
