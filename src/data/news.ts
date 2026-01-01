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
    };

export const news: NewsItem[] = [
  { type: "paper", date: "2025.12", paperId: "phantom-rendering-fse-2026" },
  { type: "paper", date: "2025.06", paperId: "maze-breaker-icse-2026" },
  { type: "paper", date: "2025.03", paperId: "haprepair-fse-industry-2025" },
];

