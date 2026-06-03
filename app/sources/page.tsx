import { HotspotAccessPanel } from "@/components/hotspot-access-panel";

export default function SourcesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">热点接口</h1>
        <p className="mt-1 text-sm text-muted-foreground">普通用户只选择接口等级，不展示后台 URL。</p>
      </div>
      <HotspotAccessPanel />
    </div>
  );
}
