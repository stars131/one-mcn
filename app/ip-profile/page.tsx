import { ResourceWorkbench } from "@/components/resource-workbench";

export default function IpProfilePage() {
  return <ResourceWorkbench title="个人 IP 定位" description="创建和维护定位、关键词、平台、商业化目标和禁用话题。" endpoint="/api/ip-profiles" fields={[
    { name: "name", label: "名称" }, { name: "niche", label: "赛道" }, { name: "targetAudience", label: "目标用户" }, { name: "valueProposition", label: "价值主张" }, { name: "toneStyle", label: "语气风格" },
    { name: "userPainPoints", label: "用户痛点 JSON 数组", type: "json", placeholder: "[\"增长慢\"]" }, { name: "platforms", label: "平台 JSON 数组", type: "json", placeholder: "[\"小红书\",\"公众号\"]" }, { name: "monetizationGoals", label: "商业化目标 JSON 数组", type: "json" }, { name: "keywords", label: "关键词 JSON 数组", type: "json" }, { name: "competitors", label: "竞品 JSON 数组", type: "json" }, { name: "blockedTopics", label: "禁用话题 JSON 数组", type: "json" }
  ]} />;
}
