import { ResourceWorkbench } from "@/components/resource-workbench";

export default function SourcesPage() {
  return <ResourceWorkbench title="热点来源管理" description="添加 GitHub、RSS、API JSON、Manual 来源，并触发测试或采集。" endpoint="/api/sources" fields={[
    { name: "name", label: "来源名称" }, { name: "type", label: "来源类型", type: "select", options: ["github", "rss", "api_json", "manual", "webpage"] }, { name: "url", label: "URL" }, { name: "config", label: "配置 JSON", type: "json", placeholder: "{\"query\":\"AI agent\"}" }
  ]} actions={[{ label: "测试", path: "/api/sources/:id/test", body: { limit: 3 } }, { label: "采集", path: "/api/sources/:id/fetch", body: { limit: 10, timeRange: "week" } }]} />;
}
