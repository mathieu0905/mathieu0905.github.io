import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBookOpen,
  FaCode,
  FaGithub,
  FaTriangleExclamation,
  FaLanguage,
  FaUpRightFromSquare,
} from "react-icons/fa6";
import { MarkdownRenderer } from "@/app/components/MarkdownRenderer";
import { TableOfContents } from "@/app/components/TableOfContents";
import {
  getAiKnowledgeArticle,
  getAiKnowledgeCategories,
  getAiKnowledgeStaticParams,
  getAiKnowledgeTopics,
} from "@/lib/aiKnowledge";
import { getTopicTitle, type AiKnowledgeLang } from "@/data/aiKnowledgeCatalog";
import {
  getAiKnowledgeFreshnessText,
  getFreshnessStatusLabel,
  type AiKnowledgeFreshnessStatus,
} from "@/data/aiKnowledgeFreshness";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

function normalizeLang(lang: string): AiKnowledgeLang | null {
  if (lang === "zh" || lang === "en") return lang;
  return null;
}

const freshnessClass: Record<AiKnowledgeFreshnessStatus, string> = {
  current: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
  watch: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
  needsUpdate: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100",
};

export function generateStaticParams() {
  return getAiKnowledgeStaticParams();
}

export default async function AiKnowledgeArticlePage({ params }: Props) {
  const { lang: rawLang, slug } = await params;
  const lang = normalizeLang(rawLang);

  if (!lang) {
    notFound();
  }

  const article = getAiKnowledgeArticle(slug, lang);
  if (!article) {
    notFound();
  }

  const topics = getAiKnowledgeTopics();
  const categories = getAiKnowledgeCategories();
  const sameCategoryTopics = topics.filter((topic) => topic.category === article.topic.category);
  const oppositeLang = lang === "zh" ? "en" : "zh";
  const freshnessText = getAiKnowledgeFreshnessText(article.freshness, lang);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-gray-950 dark:bg-gray-950 dark:text-white">
      <main className="mx-auto max-w-[1500px] px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/ai-knowledge"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
          >
            <FaArrowLeft />
            返回 AI 知识库
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={article.alternateHref}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <FaLanguage />
              {oppositeLang === "zh" ? "中文" : "English"}
            </Link>
            <a
              href={article.sourceHtmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <FaUpRightFromSquare />
              ARIS 原文
            </a>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_260px]">
          <aside className="hidden xl:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {article.category.shortLabel}
              </div>
              <div className="space-y-1">
                {sameCategoryTopics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/ai-knowledge/${lang}/${topic.slug}`}
                    className={`block rounded-lg px-3 py-2 text-sm leading-5 transition-colors ${
                      topic.slug === article.slug
                        ? "bg-cyan-50 font-semibold text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {getTopicTitle(topic, lang)}
                  </Link>
                ))}
              </div>
              <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  方向切换
                </div>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const firstTopic = topics.find((topic) => topic.category === category.id);
                    if (!firstTopic) return null;
                    return (
                      <Link
                        key={category.id}
                        href={`/ai-knowledge/${lang}/${firstTopic.slug}`}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                          category.id === article.category.id
                            ? "text-gray-950 dark:text-white"
                            : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                      >
                        {category.shortLabel}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <article className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <header className="border-b border-gray-100 p-6 dark:border-gray-800 md:p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200">
                  <FaBookOpen />
                  {article.category.label}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {article.topic.level}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  约 {article.readingTime} 分钟
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${freshnessClass[article.freshness.status]}`}>
                  {article.freshness.priority} · {getFreshnessStatusLabel(article.freshness.status, lang)}
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-normal text-gray-950 dark:text-white md:text-4xl">
                {article.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-gray-600 dark:text-gray-300">
                {article.topic.summary}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {article.topic.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 md:grid-cols-[1fr_auto]">
                <div>
                  内容来源：{article.sourceMeta.name} by {article.sourceMeta.author}，许可证 {article.sourceMeta.license}。
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    Imported from commit {article.sourceMeta.commit.slice(0, 12)}.
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={article.sourceMeta.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 font-semibold text-gray-700 shadow-sm hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <FaGithub />
                    Repo
                  </a>
                  <a
                    href={article.sourceMarkdownUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 font-semibold text-gray-700 shadow-sm hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <FaCode />
                    Markdown
                  </a>
                </div>
              </div>

              <div className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${freshnessClass[article.freshness.status]}`}>
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <FaTriangleExclamation />
                  {lang === "en" ? "Local freshness note" : "本地更新提示"}
                  {article.freshness.reviewedAt && (
                    <span className="text-xs font-medium opacity-75">
                      {lang === "en" ? "Reviewed" : "复审"} {article.freshness.reviewedAt}
                    </span>
                  )}
                </div>
                <p>{freshnessText.note}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {freshnessText.actions.map((action) => (
                    <span key={action} className="rounded-md bg-white/70 px-2.5 py-1 text-xs font-semibold dark:bg-gray-950/50">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            </header>

            <div className="p-6 md:p-8">
              <div className="prose prose-slate max-w-none dark:prose-invert prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-code:break-words">
                <MarkdownRenderer content={article.content} />
              </div>
            </div>
          </article>

          <aside className="hidden xl:block">
            <TableOfContents />
          </aside>
        </div>

        <nav className="mt-6 grid gap-3 md:grid-cols-2">
          {article.previous ? (
            <Link
              href={`/ai-knowledge/${lang}/${article.previous.slug}`}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">上一篇</div>
              <div className="font-semibold text-gray-950 dark:text-white">{getTopicTitle(article.previous, lang)}</div>
            </Link>
          ) : (
            <div />
          )}
          {article.next && (
            <Link
              href={`/ai-knowledge/${lang}/${article.next.slug}`}
              className="rounded-xl border border-gray-200 bg-white p-4 text-right shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">下一篇</div>
              <div className="inline-flex items-center justify-end gap-2 font-semibold text-gray-950 dark:text-white">
                {getTopicTitle(article.next, lang)}
                <FaArrowRight />
              </div>
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = normalizeLang(rawLang);

  if (!lang) {
    return { title: "AI Knowledge | Zhihao Lin" };
  }

  const article = getAiKnowledgeArticle(slug, lang);

  if (!article) {
    return { title: "AI Knowledge | Zhihao Lin" };
  }

  return {
    title: `${article.title} | AI 知识库 | Zhihao Lin`,
    description: article.topic.summary,
  };
}
