import { Card, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">系统设置</h1>
        <p className="mt-1 text-sm text-muted-foreground">配置 AI Provider、模型、GitHub Token、默认 IP Profile、平台和采集频率。生产环境建议使用环境变量和密钥管理。</p>
      </div>
      <Card>
        <CardTitle>AI 与采集配置</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Select defaultValue={process.env.AI_PROVIDER || "openrouter"}><option>openrouter</option><option>openai</option><option>deepseek</option></Select>
          <Input defaultValue={process.env.AI_MODEL || ""} placeholder="AI_MODEL" />
          <Input placeholder="GITHUB_TOKEN 使用环境变量配置" />
          <Input placeholder="默认平台，例如 小红书,公众号" />
          <Input placeholder="默认采集频率，例如 daily" />
          <Input placeholder="默认 IP Profile ID" />
        </div>
        <Button className="mt-4" variant="outline">保存到环境配置</Button>
      </Card>
    </div>
  );
}
