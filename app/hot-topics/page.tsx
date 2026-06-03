import { ResourceWorkbench } from "@/components/resource-workbench";

export default function HotTopicsPage() {
  return <ResourceWorkbench title="热点雷达" description="查看热点、手动添加热点，并对热点执行 AI 分析或生成选题。" endpoint="/api/hot-topics" fields={[
    { name: "title", label: "标题" }, { name: "summary", label: "摘要", type: "textarea" }, { name: "url", label: "URL" }, { name: "platform", label: "平台" }, { name: "tags", label: "标签 JSON 数组", type: "json" }
  ]} />;
}
