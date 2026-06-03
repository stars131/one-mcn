import { ResourceWorkbench } from "@/components/resource-workbench";

export default function TopicsPage() {
  return <ResourceWorkbench title="选题库" description="维护选题，按平台、状态、商业价值和流量潜力推进内容生产。" endpoint="/api/topics" fields={[
    { name: "title", label: "标题" }, { name: "corePoint", label: "核心观点" }, { name: "targetAudience", label: "目标用户" }, { name: "userPainPoint", label: "痛点" }, { name: "platform", label: "平台" }, { name: "contentType", label: "内容类型" }, { name: "reason", label: "理由", type: "textarea" }, { name: "outline", label: "大纲 JSON 数组", type: "json" }
  ]} />;
}
