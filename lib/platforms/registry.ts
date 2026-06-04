export type PlatformAdapterStatus = "planned" | "active";

export type PlatformDefinition = {
  id: string;
  label: string;
  contentTypes: string[];
  metricInputModes: string[];
  promptHints: string[];
  adapterStatus: PlatformAdapterStatus;
};

export const platformRegistry: PlatformDefinition[] = [
  {
    id: "xiaohongshu",
    label: "小红书",
    contentTypes: ["图文", "短视频脚本", "种草笔记", "清单"],
    metricInputModes: ["数据截图", "手动录入", "表格导入"],
    promptHints: ["重视封面标题、收藏价值、生活化表达"],
    adapterStatus: "planned"
  },
  {
    id: "douyin",
    label: "抖音",
    contentTypes: ["短视频脚本", "口播脚本", "直播切片", "系列短视频"],
    metricInputModes: ["视频数据截图", "手动录入", "表格导入"],
    promptHints: ["前三秒强钩子、节奏明确、口语表达"],
    adapterStatus: "planned"
  },
  {
    id: "wechat_official",
    label: "公众号",
    contentTypes: ["长文", "观点文", "教程", "复盘"],
    metricInputModes: ["阅读数据截图", "手动录入", "表格导入"],
    promptHints: ["结构完整、观点清晰、适合深度阅读"],
    adapterStatus: "planned"
  },
  {
    id: "kuaishou",
    label: "快手",
    contentTypes: ["短视频脚本", "口播脚本", "直播预告", "经验分享"],
    metricInputModes: ["视频数据截图", "手动录入", "表格导入"],
    promptHints: ["表达直接、真实感强、强调人和经验"],
    adapterStatus: "planned"
  },
  {
    id: "bilibili",
    label: "B站",
    contentTypes: ["中视频脚本", "教程", "测评", "专栏"],
    metricInputModes: ["视频数据截图", "手动录入", "表格导入"],
    promptHints: ["信息密度高、解释充分、适合系列化"],
    adapterStatus: "planned"
  },
  {
    id: "github",
    label: "GitHub",
    contentTypes: ["项目介绍", "README", "Release Note", "技术教程"],
    metricInputModes: ["仓库数据", "手动录入", "API 接入"],
    promptHints: ["突出问题、技术价值、安装使用和贡献路径"],
    adapterStatus: "planned"
  },
  {
    id: "x",
    label: "X",
    contentTypes: ["短帖", "线程", "观点", "产品更新"],
    metricInputModes: ["帖子数据截图", "手动录入", "API 接入"],
    promptHints: ["表达短促、观点鲜明、适合线程拆分"],
    adapterStatus: "planned"
  },
  {
    id: "facebook",
    label: "Facebook",
    contentTypes: ["帖子", "长帖", "社群内容", "活动预告"],
    metricInputModes: ["帖子数据截图", "手动录入", "表格导入"],
    promptHints: ["强调社群互动、讨论引导和分享动机"],
    adapterStatus: "planned"
  },
  {
    id: "zhihu",
    label: "知乎",
    contentTypes: ["问答", "长文", "观点文", "经验帖"],
    metricInputModes: ["内容数据截图", "手动录入", "表格导入"],
    promptHints: ["论证充分、回答问题、体现可信度"],
    adapterStatus: "planned"
  }
];

export const platformLabels = platformRegistry.map((platform) => platform.label);

export const defaultPlatform = "小红书";

export const contentTypeOptions = Array.from(new Set(platformRegistry.flatMap((platform) => platform.contentTypes)));

export function getPlatform(label: string) {
  return platformRegistry.find((platform) => platform.label === label || platform.id === label);
}

export function platformPromptContext() {
  return platformRegistry.map(({ label, contentTypes, promptHints }) => ({ label, contentTypes, promptHints }));
}
