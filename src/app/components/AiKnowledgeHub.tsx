"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBookOpen,
  FaBrain,
  FaFilter,
  FaGithub,
  FaLanguage,
  FaMagnifyingGlass,
  FaNetworkWired,
  FaRobot,
  FaShapes,
} from "react-icons/fa6";
import {
  aiKnowledgeCategories,
  getTopicTitle,
  type AiKnowledgeCategoryId,
  type AiKnowledgeLang,
  type AiKnowledgeTopic,
} from "@/data/aiKnowledgeCatalog";
import type { AiKnowledgeSourceMeta } from "@/lib/aiKnowledge";

const categoryIcons: Record<AiKnowledgeCategoryId, typeof FaBrain> = {
  general: FaBrain,
  postTraining: FaFilter,
  architecture: FaNetworkWired,
  generativeTheory: FaShapes,
  generationSystems: FaBookOpen,
  multimodal: FaLanguage,
  agents: FaRobot,
};

const categoryAccent: Record<AiKnowledgeCategoryId, string> = {
  general: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200",
  postTraining: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200",
  architecture: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-200",
  generativeTheory: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  generationSystems: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
  multimodal: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-900 dark:bg-fuchsia-950/30 dark:text-fuchsia-200",
  agents: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-200",
};

interface AiKnowledgeHubProps {
  topics: AiKnowledgeTopic[];
  sourceMeta: AiKnowledgeSourceMeta;
}

export function AiKnowledgeHub({ topics, sourceMeta }: AiKnowledgeHubProps) {
  const [activeCategory, setActiveCategory] = useState<AiKnowledgeCategoryId | "all">("all");
  const [lang, setLang] = useState<AiKnowledgeLang>("zh");
  const [query, setQuery] = useState("");

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return topics.filter((topic) => {
      const inCategory = activeCategory === "all" || topic.category === activeCategory;
      if (!inCategory) return false;

      if (!normalizedQuery) return true;

      const haystack = [
        topic.zhTitle,
        topic.enTitle,
        topic.summary,
        topic.level,
        ...topic.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [activeCategory, query, topics]);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-gray-950 dark:bg-gray-950 dark:text-white">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-6 border-b border-gray-200 pb-7 dark:border-gray-800">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                <FaBookOpen className="text-cyan-600 dark:text-cyan-300" />
                ARIS-in-AI-Offer · MIT · {sourceMeta.importedTutorials / 2} topics
              </div>
              <h1 className="text-3xl font-bold tracking-normal text-gray-950 dark:text-white md:text-5xl">
                AI 知识库
              </h1>
              <p className="mt-3 text-base leading-8 text-gray-600 dark:text-gray-300 md:text-lg">
                把 ARIS 的 AI 面试与研究知识点整合成可搜索、可分组、可中英切换的阅读台。适合从一个主题顺着学，也适合面试前快速横跳。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                {(["zh", "en"] as AiKnowledgeLang[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setLang(item)}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                      lang === item
                        ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {item === "zh" ? "中文" : "EN"}
                  </button>
                ))}
              </div>
              <a
                href={sourceMeta.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <FaGithub />
                源仓库
              </a>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <label htmlFor="ai-knowledge-search" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              搜索主题、关键词或概念
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
              <FaMagnifyingGlass className="text-gray-400" />
              <input
                id="ai-knowledge-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="例如 AdamW、MoE、RAG、Diffusion..."
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-6">
            <div>
              <div className="text-2xl font-bold">{topics.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">主题</div>
            </div>
            <div>
              <div className="text-2xl font-bold">7</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">方向</div>
            </div>
            <div>
              <div className="text-2xl font-bold">2</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">语言</div>
            </div>
            <div className="sm:col-span-3">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">来源</div>
              <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                {sourceMeta.name} · {sourceMeta.author} · {sourceMeta.license}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              activeCategory === "all"
                ? "border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            全部
          </button>
          {aiKnowledgeCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                activeCategory === category.id
                  ? categoryAccent[category.id]
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {category.shortLabel}
            </button>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-3">
              {aiKnowledgeCategories.map((category) => {
                const Icon = categoryIcons[category.id];
                const count = topics.filter((topic) => topic.category === category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      activeCategory === category.id
                        ? categoryAccent[category.id]
                        : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Icon />
                        <span className="text-sm font-semibold">{category.shortLabel}</span>
                      </div>
                      <span className="text-xs opacity-70">{count}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 opacity-80">{category.description}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {filteredTopics.length} 个匹配主题
              </div>
              {activeCategory !== "all" && (
                <button
                  onClick={() => setActiveCategory("all")}
                  className="text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
                >
                  清除分类
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredTopics.map((topic) => {
                const category = aiKnowledgeCategories.find((item) => item.id === topic.category);
                const Icon = categoryIcons[topic.category];
                return (
                  <Link
                    key={topic.slug}
                    href={`/ai-knowledge/${lang}/${topic.slug}`}
                    className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${categoryAccent[topic.category]}`}>
                        <Icon />
                        {category?.shortLabel}
                      </div>
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {topic.level}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold leading-7 text-gray-950 dark:text-white">
                      {getTopicTitle(topic, lang)}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300 [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
                      {topic.summary}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {topic.keywords.slice(0, 3).map((keyword) => (
                        <span key={keyword} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 group-hover:underline dark:text-cyan-300">
                      打开阅读
                      <FaArrowRight className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {filteredTopics.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                没有匹配的主题，换个关键词试试。
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
