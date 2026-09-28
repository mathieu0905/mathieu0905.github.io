type LocalizedText = { zh: string; en: string };

export type NewsItem =
  | {
      type: "paper";
      date: string; // YYYY.MM
      paperId: string;
    }
  | {
      type: "other";
      date: string; // YYYY.MM
      title: LocalizedText;
      detail?: LocalizedText;
      link?: string;
    };

export const news: NewsItem[] = [
  {
    type: "other",
    date: "2026.08",
    title: {
      zh: "OpenHarmony Bench 技术报告上线 arXiv：能编译，不等于真的完成了应用需求",
      en: "OpenHarmony Bench is on arXiv: successful compilation does not guarantee task completion",
    },
    detail: {
      zh: "我在实习期间参与的 OpenHarmony 应用级 coding-agent benchmark，覆盖新功能开发、规格驱动实现和真实缺陷修复。",
      en: "An app-level coding-agent benchmark I contributed to during my internship, covering new features, specification-driven implementation, and real bug fixes in OpenHarmony.",
    },
    link: "/blog/paper-openharmony-bench",
  },
  {
    type: "other",
    date: "2026.07",
    title: {
      zh: "AtomicCommitBench 论文上线 arXiv：代码智能体不该只交一坨 diff",
      en: "AtomicCommitBench is on arXiv: coding agents should deliver more than a single diff",
    },
    detail: {
      zh: "把 squashed patch 重新组织成可 replay、可 review、可 selective revert 的原子提交历史。",
      en: "Reorganizing squashed patches into atomic commit histories that can be replayed, reviewed, and selectively reverted.",
    },
    link: "/blog/paper-atomiccommitbench",
  },
  {
    type: "other",
    date: "2026.07",
    title: {
      zh: "开源 SkillLens：面向 Codex / Claude Code 的 SKILL 可视化优化框架",
      en: "Introducing SkillLens: an open-source framework for visualizing and optimizing skills for Codex and Claude Code",
    },
    detail: {
      zh: "把 SKILL.md 约束与真实 agent 轨迹对齐，展示覆盖、违反、忽略路径，并生成 anti-bloat 优化建议。",
      en: "Aligning SKILL.md constraints with agent traces to reveal followed, violated, and ignored instructions and suggest improvements without bloating the skill.",
    },
    link: "https://github.com/mathieu0905/skilllens",
  },
  {
    type: "other",
    date: "2026.07",
    title: {
      zh: "RepoRescue 论文上线 arXiv：旧仓库不是坏了，是世界变了",
      en: "RepoRescue is on arXiv: rescuing old repositories from ecosystem drift",
    },
    detail: {
      zh: "关于 LLM agents 能否真正修源码、拯救被生态漂移困住的旧仓库。",
      en: "Studying whether LLM agents can repair source code to restore repositories affected by changes in their software ecosystems.",
    },
    link: "/blog/paper-reporescue",
  },
  { type: "paper", date: "2026.06", paperId: "run-less-issta-2026" },
  { type: "paper", date: "2026.06", paperId: "codeanchor-issta-2026" },
  { type: "paper", date: "2026.04", paperId: "eager-parallel-execution" },
  { type: "paper", date: "2026.04", paperId: "codebridge-emse-2026" },
  {
    type: "other", date: "2026.03",
    title: {
      zh: "开源项目 ResearchClaw — AI 驱动的科研桌面应用",
      en: "ResearchClaw: an open-source AI-powered desktop app for research",
    },
    link: "https://github.com/Noietch/ResearchClaw",
  },
  {
    type: "other", date: "2026.05",
    title: {
      zh: "Exploring Code Analysis: Zero-Shot Insights on Syntax and Semantics with LLMs — 被 TOSEM 正式接收",
      en: "Exploring Code Analysis: Zero-Shot Insights on Syntax and Semantics with LLMs — accepted at TOSEM",
    },
    link: "/blog/paper-llm-code-analysis",
  },
  { type: "paper", date: "2025.12", paperId: "phantom-rendering-fse-2026" },
  { type: "paper", date: "2025.06", paperId: "maze-breaker-icse-2026" },
  { type: "paper", date: "2025.03", paperId: "haprepair-fse-industry-2025" },
  {
    type: "other", date: "2025.01",
    title: {
      zh: "我的第一篇文章 Open-Source AI-based SE Tools: Opportunities and Challenges of Collaborative Software Learning 被 TOSEM 正式接收",
      en: "My first paper, Open-Source AI-based SE Tools: Opportunities and Challenges of Collaborative Software Learning, was accepted at TOSEM",
    },
  },
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
