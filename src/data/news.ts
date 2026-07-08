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
  {
    type: "other",
    date: "2026.07",
    title: "AtomicCommitBench 论文上线 arXiv：代码智能体不该只交一坨 diff",
    detail: "把 squashed patch 重新组织成可 replay、可 review、可 selective revert 的原子提交历史。",
    link: "/blog/paper-atomiccommitbench",
  },
  {
    type: "other",
    date: "2026.07",
    title: "开源 SkillLens：面向 Codex / Claude Code 的 SKILL 可视化优化框架",
    detail: "把 SKILL.md 约束与真实 agent 轨迹对齐，展示覆盖、违反、忽略路径，并生成 anti-bloat 优化建议。",
    link: "https://github.com/mathieu0905/skilllens",
  },
  {
    type: "other",
    date: "2026.07",
    title: "RepoRescue 论文上线 arXiv：旧仓库不是坏了，是世界变了",
    detail: "关于 LLM agents 能否真正修源码、拯救被生态漂移困住的旧仓库。",
    link: "/blog/paper-reporescue",
  },
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
