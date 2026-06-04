export const prompts = {
  normalHotTopicAnalysis: (input: unknown) => `你是人设运营分析师。根据热点与人设输出 JSON：${JSON.stringify(input)}
格式：{"summary":"","heatScore":0,"matchScore":0,"businessScore":0,"competitionScore":0,"freshnessScore":0,"recommendationScore":0,"recommendedAngles":[{"angle":"","reason":"","targetAudience":"","suitablePlatforms":[],"contentFormats":[]}],"riskNotes":[],"keywords":[],"suggestedTitles":[]}`,
  githubProjectAnalysis: (input: unknown) => `你是 GitHub 开源项目内容机会分析师。根据项目和人设输出 JSON：${JSON.stringify(input)}
格式：{"projectSummary":"","targetUsers":[],"whyItMatters":"","creatorOpportunity":"","tutorialValueScore":0,"businessInspirationScore":0,"developerValueScore":0,"generalAudienceScore":0,"matchScore":0,"recommendationScore":0,"recommendedAngles":[{"angle":"","title":"","platform":"","contentFormat":"","reason":""}],"contentWarnings":[],"keywords":[]}`,
  topicGeneration: (input: unknown) => `基于热点、人设和历史高表现内容，生成 10 个选题 JSON 数组：${JSON.stringify(input)}
格式：[{"title":"","corePoint":"","targetAudience":"","userPainPoint":"","platform":"","contentType":"","trafficScore":0,"businessScore":0,"difficultyScore":0,"reason":"","outline":[]}]`,
  contentGeneration: (input: unknown) => `基于选题和人设生成内容草稿 JSON：${JSON.stringify(input)}
格式：{"titles":[],"coverTexts":[],"hook":"","body":"","cta":"","tags":[],"commentGuide":"","repurposeSuggestions":[{"platform":"","suggestion":""}]}`,
  platformAdaptation: (input: unknown) => `将内容改写为目标平台版本，保留核心观点并输出 JSON：${JSON.stringify(input)}
格式：{"titles":[],"coverTexts":[],"hook":"","body":"","cta":"","tags":[],"commentGuide":"","repurposeSuggestions":[]}`,
  reviewReport: (input: unknown) => `基于周期数据分析生成个人 IP 运营复盘 JSON：${JSON.stringify(input)}
格式：{"summary":"","keyFindings":[],"winningPatterns":[],"losingPatterns":[],"bestContents":[],"worstContents":[],"platformInsights":[],"topicInsights":[],"titleInsights":[],"continueDoing":[],"stopDoing":[],"testNext":[],"nextTopicSuggestions":[{"title":"","reason":"","platform":"","contentType":"","expectedMetric":""}]}`
};
