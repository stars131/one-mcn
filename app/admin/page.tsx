import { Card, CardTitle } from "@/components/ui/card";
import { AdminHotspotSettings } from "@/components/admin-hotspot-settings";
import { requireAdminUser } from "@/lib/admin";
import { getHotspotSettings } from "@/lib/app-settings";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminUser();
  const hotspotSettings = await getHotspotSettings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">管理员</h1>
        <p className="mt-1 text-sm text-muted-foreground">配置普通用户不可见的系统接口、价格和平台级能力。</p>
      </div>
      <Card>
        <CardTitle>热点接口配置</CardTitle>
        <div className="mt-4">
          <AdminHotspotSettings initial={hotspotSettings} />
        </div>
      </Card>
    </div>
  );
}
