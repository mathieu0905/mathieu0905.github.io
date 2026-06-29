import fs from "fs";
import path from "path";
import {
  aiKnowledgeCategories,
  aiKnowledgeTopics,
  getTopicTitle,
  type AiKnowledgeCategory,
  type AiKnowledgeLang,
  type AiKnowledgeTopic,
} from "@/data/aiKnowledgeCatalog";
import { getAiKnowledgeFreshnessNote, type AiKnowledgeFreshnessNote } from "@/data/aiKnowledgeFreshness";

const knowledgeDirectory = path.join(process.cwd(), "src/content/ai-knowledge");
const tutorialsDirectory = path.join(knowledgeDirectory, "tutorials");
const sourceMetaPath = path.join(knowledgeDirectory, "source-meta.json");

export interface AiKnowledgeSourceMeta {
  name: string;
  repo: string;
  site: string;
  author: string;
  license: string;
  commit: string;
  importedTutorials: number;
}

export interface AiKnowledgeArticle {
  slug: string;
  lang: AiKnowledgeLang;
  topic: AiKnowledgeTopic;
  category: AiKnowledgeCategory;
  title: string;
  content: string;
  readingTime: number;
  sourceMeta: AiKnowledgeSourceMeta;
  sourceMarkdownUrl: string;
  sourceHtmlUrl: string;
  alternateHref: string;
  freshness: AiKnowledgeFreshnessNote;
  previous?: AiKnowledgeTopic;
  next?: AiKnowledgeTopic;
}

const defaultSourceMeta: AiKnowledgeSourceMeta = {
  name: "ARIS-in-AI-Offer",
  repo: "https://github.com/wanshuiyin/ARIS-in-AI-Offer",
  site: "https://wanshuiyin.github.io/ARIS-in-AI-Offer",
  author: "Ruofeng Yang (杨若峰)",
  license: "MIT",
  commit: "unknown",
  importedTutorials: 0,
};

function estimateReadingTime(content: string): number {
  const cjkChars = (content.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const words = content.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, "").split(/\s+/).filter(Boolean).length;
  const minutes = cjkChars / 500 + words / 250;
  return Math.max(1, Math.round(minutes));
}

function sourceMarkdownPath(topic: AiKnowledgeTopic, lang: AiKnowledgeLang) {
  const fileStem = topic.slug.replaceAll("-", "_");
  const file = `${fileStem}_tutorial${lang === "en" ? "_en" : ""}.md`;
  return `docs/tutorials/${file}`;
}

function sourceHtmlPath(topic: AiKnowledgeTopic, lang: AiKnowledgeLang) {
  const fileStem = topic.slug.replaceAll("-", "_");
  const file = `${fileStem}_tutorial${lang === "en" ? "_en" : ""}.html`;
  return `tutorials/${file}`;
}

function readSourceMeta(): AiKnowledgeSourceMeta {
  if (!fs.existsSync(sourceMetaPath)) {
    return defaultSourceMeta;
  }

  return {
    ...defaultSourceMeta,
    ...JSON.parse(fs.readFileSync(sourceMetaPath, "utf8")),
  };
}

function rewriteRelativeLinks(content: string, lang: AiKnowledgeLang) {
  return content.replace(
    /(!?\[[^\]]*\]\()((?!https?:\/\/|mailto:|#|\/|data:)[^)]+)(\))/g,
    (match, prefix: string, href: string, suffix: string) => {
      const [rawPath, hash = ""] = href.split("#");
      const normalized = rawPath.replace(/^\.\//, "");

      if (normalized.startsWith("code/")) {
        return `${prefix}/ai-knowledge/${normalized}${hash ? `#${hash}` : ""}${suffix}`;
      }

      if (normalized.endsWith(".md")) {
        const targetSlug = path
          .basename(normalized, ".md")
          .replace(/_tutorial(_en)?$/, "")
          .replaceAll("_", "-");
        return `${prefix}/ai-knowledge/${lang}/${targetSlug}${hash ? `#${hash}` : ""}${suffix}`;
      }

      if (normalized.endsWith(".html")) {
        const targetSlug = path
          .basename(normalized, ".html")
          .replace(/_tutorial(_en)?$/, "")
          .replaceAll("_", "-");
        return `${prefix}/ai-knowledge/${lang}/${targetSlug}${hash ? `#${hash}` : ""}${suffix}`;
      }

      return match;
    },
  );
}

function getNeighborTopics(topic: AiKnowledgeTopic) {
  const index = aiKnowledgeTopics.findIndex((item) => item.slug === topic.slug);
  return {
    previous: index > 0 ? aiKnowledgeTopics[index - 1] : undefined,
    next: index >= 0 && index < aiKnowledgeTopics.length - 1 ? aiKnowledgeTopics[index + 1] : undefined,
  };
}

export function getAiKnowledgeSourceMeta() {
  return readSourceMeta();
}

export function getAiKnowledgeTopics() {
  return aiKnowledgeTopics;
}

export function getAiKnowledgeCategories() {
  return aiKnowledgeCategories;
}

export function getAiKnowledgeTopic(slug: string) {
  return aiKnowledgeTopics.find((topic) => topic.slug === slug) ?? null;
}

export function getAiKnowledgeArticle(slug: string, lang: AiKnowledgeLang): AiKnowledgeArticle | null {
  const topic = getAiKnowledgeTopic(slug);

  if (!topic) {
    return null;
  }

  const fullPath = path.join(tutorialsDirectory, lang, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const content = rewriteRelativeLinks(fs.readFileSync(fullPath, "utf8"), lang);
  const category = aiKnowledgeCategories.find((item) => item.id === topic.category) ?? aiKnowledgeCategories[0];
  const sourceMeta = readSourceMeta();
  const { previous, next } = getNeighborTopics(topic);

  return {
    slug,
    lang,
    topic,
    category,
    title: getTopicTitle(topic, lang),
    content,
    readingTime: estimateReadingTime(content),
    sourceMeta,
    sourceMarkdownUrl: `${sourceMeta.repo}/blob/${sourceMeta.commit}/${sourceMarkdownPath(topic, lang)}`,
    sourceHtmlUrl: `${sourceMeta.site}/${sourceHtmlPath(topic, lang)}`,
    alternateHref: `/ai-knowledge/${lang === "zh" ? "en" : "zh"}/${slug}`,
    freshness: getAiKnowledgeFreshnessNote(slug),
    previous,
    next,
  };
}

export function getAiKnowledgeStaticParams() {
  return aiKnowledgeTopics.flatMap((topic) => [
    { lang: "zh", slug: topic.slug },
    { lang: "en", slug: topic.slug },
  ]);
}
