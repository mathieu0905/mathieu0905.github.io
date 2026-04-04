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
  { type: "paper", date: "2026.04", paperId: "eager-parallel-execution" },
  { type: "paper", date: "2026.04", paperId: "codebridge-emse-2026" },
  { type: "other", date: "2026.03", title: "获得华为 AI 软件开发实习 Offer，计划开展 Android → HarmonyOS 迁移相关研究" },
  { type: "other", date: "2026.03", title: "开源项目 ResearchClaw — AI 驱动的科研桌面应用", link: "https://github.com/Noietch/ResearchClaw" },
  { type: "other", date: "2026.02", title: "LLMs: Understanding Code Syntax and Semantics for Code Analysis — 收到 TOSEM Minor Revision" },
  { type: "paper", date: "2025.12", paperId: "phantom-rendering-fse-2026" },
  { type: "paper", date: "2025.06", paperId: "maze-breaker-icse-2026" },
  { type: "paper", date: "2025.03", paperId: "haprepair-fse-industry-2025" },
  { type: "paper", date: "2023.11", paperId: "llm-code-syntax-semantics" },
];

