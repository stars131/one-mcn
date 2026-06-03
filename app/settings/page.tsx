import { Card, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getModelConfig } from "@/lib/ai/llm-client";

export default function SettingsPage() {
  const config = getModelConfig();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">系统设置</h1>
        <p className="mt-1 text-sm text-muted-foreground">配置 AI Provider、语言模型、多模态模型、生图模型、默认平台和采集频率。生产环境建议使用环境变量和密钥管理。</p>
      </div>
      <Card>
        <CardTitle>AI 模型配置</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Select defaultValue={config.provider}><option>newapi</option><option>openrouter</option><option>openai</option><option>deepseek</option></Select>
          <Input defaultValue={config.baseUrl} placeholder="AI_BASE_URL" />
          <Input defaultValue={config.textModel} placeholder="AI_TEXT_MODEL 语言模型" />
          <Input defaultValue={config.multimodalModel} placeholder="AI_MULTIMODAL_MODEL 多模态模型" />
          <Input defaultValue={config.imageModel} placeholder="AI_IMAGE_MODEL 生图模型" />
          <Input placeholder="AI_API_KEY 使用环境变量配置" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">当前设置页先展示环境配置；后续商业化接入用户级模型配置时，可复用这些字段。</p>
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
