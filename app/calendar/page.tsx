import { ResourceWorkbench } from "@/components/resource-workbench";
import { platformLabels } from "@/lib/platforms/registry";

export default function CalendarPage() {
  return <ResourceWorkbench title="发布计划" description="设置发布时间，标记已发布并记录发布链接。" endpoint="/api/publish-records" fields={[
    { name: "contentId", label: "Content ID" }, { name: "platform", label: "平台", type: "select", options: platformLabels }, { name: "plannedAt", label: "计划时间", type: "date" }, { name: "publishedAt", label: "发布时间", type: "date" }, { name: "publishedUrl", label: "发布链接" }, { name: "status", label: "状态", type: "select", options: ["planned", "published", "failed"] }
  ]} />;
}
