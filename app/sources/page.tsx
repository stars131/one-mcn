import { ResourceWorkbench } from "@/components/resource-workbench";

export default function SourcesPage() {
  return <ResourceWorkbench title="热点接口来源" description="通过标准热点接口 URL 拉取信息，并触发测试或采集。" endpoint="/api/sources" fields={[
    { name: "name", label: "来源名称" }, { name: "type", label: "来源类型", type: "select", options: ["hot_feed", "api_json", "manual", "github", "rss", "webpage"] }, { name: "url", label: "URL" }, { name: "config", label: "配置 JSON", type: "json", placeholder: "{\"url\":\"http://127.0.0.1:4100/api/hot-topics\"}" }
  ]} actions={[{ label: "测试", path: "/api/sources/:id/test", body: { limit: 3 } }, { label: "采集", path: "/api/sources/:id/fetch", body: { limit: 10, timeRange: "week" } }]} />;
}
