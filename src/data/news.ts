export type NewsItem =
  | {
      type: "paper";
      date: string; // YYYY.MM
      paperId: string;
    }
  | {
      type: "other";
      date: string; // YYYY.MM
      title: string;
      detail?: string;
      link?: string;
    };

export const news: NewsItem[] = [
  { type: "paper", date: "2026.07", paperId: "reporescue-arxiv-2026" },
  { type: "paper", date: "2026.06", paperId: "run-less-issta-2026" },
  { type: "paper", date: "2026.06", paperId: "codeanchor-issta-2026" },
  { type: "paper", date: "2026.04", paperId: "eager-parallel-execution" },
  { type: "paper", date: "2026.04", paperId: "codebridge-emse-2026" },
  { type: "other", date: "2026.03", title: "开源项目 ResearchClaw — AI 驱动的科研桌面应用", link: "https://github.com/Noietch/ResearchClaw" },
  { type: "other", date: "2026.05", title: "Exploring Code Analysis: Zero-Shot Insights on Syntax and Semantics with LLMs — 被 TOSEM 正式接收", link: "/blog/paper-llm-code-analysis" },
  { type: "paper", date: "2025.12", paperId: "phantom-rendering-fse-2026" },
  { type: "paper", date: "2025.06", paperId: "maze-breaker-icse-2026" },
  { type: "paper", date: "2025.03", paperId: "haprepair-fse-industry-2025" },
  { type: "other", date: "2025.01", title: "我的第一篇文章 Open-Source AI-based SE Tools: Opportunities and Challenges of Collaborative Software Learning 被 TOSEM 正式接收" },
];

function newsDateValue(date: string) {
  const [year, month] = date.split(".").map(Number);
  return year * 100 + month;
}

export const sortedNews = [...news].sort((a, b) => {
  const diff = newsDateValue(b.date) - newsDateValue(a.date);
  if (diff !== 0) return diff;
  return 0;
});
