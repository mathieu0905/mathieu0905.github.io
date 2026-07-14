export const BLOG_CATEGORIES = [
  {
    key: "arxiv",
    label: "arXiv 导读",
    description: "每日论文速递与专题解读",
  },
  {
    key: "research",
    label: "我的论文",
    description: "已发表工作与研究项目",
  },
  {
    key: "reading",
    label: "论文精读",
    description: "经典论文与前沿专题笔记",
  },
  {
    key: "notes",
    label: "技术随笔",
    description: "研究之外的思考与实践",
  },
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]["key"];

interface CategorySource {
  category?: unknown;
  slug?: string;
  tags?: string[];
  series?: string;
}

export function isBlogCategory(value: unknown): value is BlogCategory {
  return BLOG_CATEGORIES.some((category) => category.key === value);
}

export function resolveBlogCategory({
  category,
  slug = "",
  tags = [],
  series = "",
}: CategorySource): BlogCategory {
  if (isBlogCategory(category)) {
    return category;
  }

  const normalizedSlug = slug.toLowerCase();
  const normalizedSeries = series.toLowerCase();
  const normalizedTags = tags.map((tag) => tag.toLowerCase());

  if (
    normalizedSlug.startsWith("arxiv-daily-") ||
    normalizedSlug.startsWith("alphaxiv-") ||
    normalizedSeries.includes("arxiv") ||
    normalizedTags.some((tag) => tag === "arxiv" || tag === "arxiv速递")
  ) {
    return "arxiv";
  }

  if (normalizedSlug.startsWith("paper-")) {
    return "research";
  }

  if (
    normalizedSlug.endsWith("-reading") ||
    normalizedTags.some((tag) => tag === "论文阅读")
  ) {
    return "reading";
  }

  return "notes";
}

export function getBlogCategoryDefinition(category: BlogCategory) {
  return BLOG_CATEGORIES.find((item) => item.key === category) ?? BLOG_CATEGORIES[3];
}
