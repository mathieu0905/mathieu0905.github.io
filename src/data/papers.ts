export type PaperTag =
  | "LLM Security"
  | "Program Repair"
  | "Static Analysis"
  | "Performance"
  | "Survey"
  | "Vision"
  | "Misc";

export type PaperStatus = "accepted" | "manuscript";

export interface Paper {
  id: string;
  title: string;
  venue?: string;
  year?: number;
  acceptedYear?: number; // year the paper was accepted (for year-in-review)
  authors?: string[];
  tags?: PaperTag[];
  status: PaperStatus;
  abstract?: string; // short intro for non-accepted items
  pdfFile?: string; // only used for accepted items, under `public/papers/`
}

function titleFromFilename(pdfFile: string) {
  const base = pdfFile.replace(/\.pdf$/i, "");
  const normalized = base
    .replace(/^_+/, "")
    .replace(/__+/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const withAcronyms = normalized
    .replace(/\bllm\b/gi, "LLM")
    .replace(/\btosem\b/gi, "TOSEM")
    .replace(/\bicse\b/gi, "ICSE")
    .replace(/\bfse\b/gi, "FSE")
    .replace(/\bscis\b/gi, "SCIS")
    .replace(/\bopenharmony\b/gi, "OpenHarmony");

  return withAcronyms
    .split(" ")
    .map((word) => {
      if (/^(LLM|TOSEM|ICSE|FSE|SCIS|OpenHarmony)$/i.test(word)) return word;
      if (/^\d{4}$/.test(word)) return word;
      return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export const papers: Paper[] = [
  {
    id: "phantom-rendering-fse-2026",
    title: "Phantom Rendering Detection: Identifying and Analyzing Unnecessary UI Computations",
    venue: "FSE",
    year: 2026,
    acceptedYear: 2025,
    authors: ["Zhihao Lin", "Mingyi Zhou", "Han Hu", "Bo Sun", "Gang Fan", "Li Li"],
    tags: ["Performance"],
    status: "accepted",
    pdfFile: "hapray_fse.pdf",
  },
  {
    id: "maze-breaker-icse-2026",
    title: "MazeBreaker: Multi-Agent Reinforcement Learning for Dynamic Jailbreaking of LLM Security Defenses",
    venue: "ICSE",
    year: 2026,
    acceptedYear: 2025,
    authors: ["Zhihao Lin", "Wei Ma", "Mingyi Zhou", "Yanjie Zhao", "Haoyu Wang", "Yang Liu", "Jun Wang", "Li Li"],
    tags: ["LLM Security"],
    status: "accepted",
    pdfFile: "ICSE_2026.pdf",
  },
  {
    id: "haprepair-fse-industry-2025",
    title: "HapRepair: Learn to Repair OpenHarmony Apps",
    venue: "FSE Industry",
    year: 2025,
    acceptedYear: 2025,
    authors: ["Zhihao Lin", "Mingyi Zhou", "Wei Ma", "Chi Chen", "Yun Yang", "Jun Wang", "Chunming Hu", "Li Li"],
    tags: ["Program Repair", "Static Analysis"],
    status: "accepted",
    pdfFile: "_FSE_Industry2025__Learn_to_Repair_OpenHarmony_Apps.pdf",
  },
  {
    id: "codebridge-emse-2026",
    title: "Effective Fine-tuning for Low-resource Languages: A Case Study of Cangjie",
    venue: "EMSE",
    year: 2026,
    acceptedYear: 2025,
    authors: ["Zhihao Lin", "Zhaofeng Liu", "Mingyi Zhou", "Zihan Huang", "Chi Chen", "Wei Ma", "Li Li"],
    tags: ["Misc"],
    status: "accepted",
    pdfFile: "Effective_Fine_tuning_for_Low_resource_Languages__A_Case_Study_of_Cangjie.pdf",
  },
  {
    id: "open-source-ai-se-tools",
    title: "Open-Source AI-based SE Tools: Opportunities and Challenges of Collaborative Software Learning",
    venue: "TOSEM",
    year: 2024,
    acceptedYear: 2024,
    authors: ["Zhihao Lin", "Wei Ma", "Tao Lin", "Yaowen Zheng", "Jingquan Ge", "Jun Wang", "Jacques Klein", "Tegawende Bissyande", "Yang Liu", "Li Li"],
    tags: ["Survey"],
    status: "accepted",
    pdfFile: "fse_2030.pdf",
  },
  {
    id: "llm-code-syntax-semantics",
    title: "LLMs: Understanding Code Syntax and Semantics for Code Analysis",
    venue: "TOSEM",
    authors: ["Wei Ma*", "Zhihao Lin*", "Shangqing Liu", "Qiang Hu", "Ye Liu", "Wenhan Wang", "Cen Zhang", "Liming Nie", "Li Li", "Yang Liu", "Lingxiao Jiang"],
    tags: ["Static Analysis"],
    status: "manuscript",
    abstract: "A systematic study evaluating LLMs' capabilities for code syntax and semantics understanding, including AST, CFG, and call graph comprehension across multiple languages.",
    pdfFile: "2305.12138v4.pdf",
  },
  {
    id: "eager-parallel-execution",
    title: "Executing as You Generate: Hiding Execution Latency in LLM Code Generation",
    authors: ["Zhensu Sun*", "Zhihao Lin*", "Zhi Chen", "Chengran Yang", "Mingyi Zhou", "Li Li", "David Lo"],
    status: "manuscript",
    abstract: "Proposes EAGER, a parallel execution paradigm for LLM code generation that overlaps code generation and execution, reducing end-to-end latency by up to 55%.",
    pdfFile: "2604.00491v1.pdf",
  },
];

export const acceptedPapers = papers.filter((paper) => paper.status === "accepted");
export const manuscriptPapers = papers.filter((paper) => paper.status === "manuscript");

export const acceptedPapers2025 = acceptedPapers.filter((paper) => paper.acceptedYear === 2025);
