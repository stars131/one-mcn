import { Card, CardTitle } from "@/components/ui/card";

const overview = [
  ["今日推荐热点", "从热点雷达中按推荐指数排序处理"],
  ["待处理选题", "生成内容前先审核选题质量"],
  ["待发布内容", "进入发布计划设置发布时间"],
  ["本周内容数", "录入发布数据后自动更新"],
  ["本周阅读量", "来自 ContentMetric 汇总"],
  ["本周涨粉数", "用于复盘转粉能力"],
  ["本周最佳内容", "按综合评分排序"],
  ["最新复盘建议", "由 AI 复盘报告输出"]
];

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">仪表盘</h1>
        <p className="mt-1 text-sm text-muted-foreground">个人 IP 定位、热点采集、选题、内容、发布和复盘的半自动运营工作台。</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {overview.map(([title, text]) => (
          <Card key={title}>
            <CardTitle>{title}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{text}</p>
          </Card>
        ))}
      </div>
      <Card>
        <CardTitle>推荐流程</CardTitle>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-5">
          {["IP 定位", "添加来源", "采集热点", "AI 分析", "生成选题", "生成内容", "平台适配", "发布计划", "数据录入", "复盘优化"].map((step) => <div key={step} className="rounded-md border bg-white p-3">{step}</div>)}
        </div>
      </Card>
    </div>
  );
}
