import { ResourceWorkbench } from "@/components/resource-workbench";
import { contentTypeOptions, platformLabels } from "@/lib/platforms/registry";

export default function ContentsPage() {
  return <ResourceWorkbench title="内容工作台" description="Markdown 草稿、标题、封面文案、平台适配和待发布状态管理。" endpoint="/api/contents" fields={[
    { name: "platform", label: "平台", type: "select", options: platformLabels }, { name: "contentType", label: "内容类型", type: "select", options: contentTypeOptions }, { name: "title", label: "标题" }, { name: "titles", label: "备选标题 JSON 数组", type: "json" }, { name: "coverTexts", label: "封面文案 JSON 数组", type: "json" }, { name: "hook", label: "开头" }, { name: "body", label: "Markdown 正文", type: "markdown" }, { name: "cta", label: "CTA" }, { name: "tags", label: "标签 JSON 数组", type: "json" }, { name: "commentGuide", label: "评论引导" }
  ]} actions={platformLabels.map((platform) => ({ label: `适配${platform}`, path: "/api/contents/:id/adapt-platform", body: { targetPlatform: platform } }))} />;
}
