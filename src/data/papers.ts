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
    id: "paper-library-chain-tracking",
    title: titleFromFilename("chain_tracking_fse.pdf"),
    status: "manuscript",
    abstract: "Explores chain tracking techniques for program analysis and software engineering tasks.",
  },
  {
    id: "paper-library-codeanchor",
    title: titleFromFilename("codeanchor.pdf"),
    status: "manuscript",
    abstract: "Investigates a code anchoring approach to stabilize code understanding and downstream analysis.",
  },
  {
    id: "paper-library-hapray",
    title: titleFromFilename("hapray_fse.pdf"),
    status: "manuscript",
    abstract: "A manuscript around OpenHarmony app reliability, tooling, or automated repair workflows.",
  },
  {
    id: "paper-library-llm-code-analysis-tosem",
    title: titleFromFilename("llm_code_analysis_tosem.pdf"),
    venue: "TOSEM",
    tags: ["Survey", "Static Analysis"],
    status: "manuscript",
    abstract: "A survey-style manuscript on LLMs for code analysis, with lessons and open problems.",
  },
  {
    id: "paper-library-scis",
    title: titleFromFilename("SCIS.pdf"),
    venue: "SCIS",
    tags: ["Misc"],
    status: "manuscript",
    abstract: "A manuscript prepared for SCIS covering a software engineering topic in progress.",
  },
];

export const acceptedPapers = papers.filter((paper) => paper.status === "accepted");
export const manuscriptPapers = papers.filter((paper) => paper.status === "manuscript");

export const acceptedPapers2025 = acceptedPapers.filter((paper) => paper.acceptedYear === 2025);
