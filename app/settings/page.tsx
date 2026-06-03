import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getModelConfig } from "@/lib/ai/llm-client";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ModelSettingsForm } from "@/components/model-settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const config = await getModelConfig();
  const user = await getCurrentUser();
  const preference = user ? await prisma.userModelPreference.findUnique({ where: { userId: user.id } }) : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">系统设置</h1>
        <p className="mt-1 text-sm text-muted-foreground">配置 AI Provider、语言模型、多模态模型、生图模型、默认平台和采集频率。生产环境建议使用环境变量和密钥管理。</p>
      </div>
      <Card>
        <CardTitle>AI 模型配置</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">默认使用服务器积分模型；也可以切换为自带 Key，由用户自己的模型服务完成调用。</p>
        <div className="mt-4">
          <ModelSettingsForm initial={{ ...config, hasCustomKey: Boolean(preference?.apiKey) }} />
        </div>
      </Card>
      <Card>
        <CardTitle>运营配置</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input placeholder="热点接口 URL，例如 http://127.0.0.1:4100/api/hot-topics" />
          <Input placeholder="默认平台，例如 小红书,公众号" />
          <Input placeholder="默认采集频率，例如 daily" />
          <Input placeholder="默认 IP Profile ID" />
        </div>
        <Button className="mt-4" variant="outline">保存到环境配置</Button>
      </Card>
    </div>
  );
}
