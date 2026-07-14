"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { BlogPostMeta } from "@/lib/blog";
import {
  BLOG_CATEGORIES,
  getBlogCategoryDefinition,
  isBlogCategory,
  type BlogCategory,
} from "@/lib/blogCategories";

interface Props {
  posts: BlogPostMeta[];
  allTags: string[];
}

type ArchiveFilter = BlogCategory | "all";

const CATEGORY_STYLES: Record<
  ArchiveFilter,
  { marker: string; active: string; border: string; badge: string }
> = {
  all: {
    marker: "bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900",
    active: "border-slate-500 bg-slate-50 ring-slate-200 dark:border-slate-400 dark:bg-slate-800 dark:ring-slate-700",
    border: "border-l-slate-400",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  },
  arxiv: {
    marker: "bg-emerald-600 text-white",
    active: "border-emerald-500 bg-emerald-50 ring-emerald-100 dark:border-emerald-500 dark:bg-emerald-950/30 dark:ring-emerald-900",
    border: "border-l-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  },
  research: {
    marker: "bg-indigo-600 text-white",
    active: "border-indigo-500 bg-indigo-50 ring-indigo-100 dark:border-indigo-500 dark:bg-indigo-950/30 dark:ring-indigo-900",
    border: "border-l-indigo-500",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
  },
  reading: {
    marker: "bg-amber-500 text-white",
    active: "border-amber-500 bg-amber-50 ring-amber-100 dark:border-amber-500 dark:bg-amber-950/30 dark:ring-amber-900",
    border: "border-l-amber-500",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
  },
  notes: {
    marker: "bg-rose-500 text-white",
    active: "border-rose-500 bg-rose-50 ring-rose-100 dark:border-rose-500 dark:bg-rose-950/30 dark:ring-rose-900",
    border: "border-l-rose-500",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
  },
};

const CATEGORY_MARKS: Record<ArchiveFilter, string> = {
  all: "全",
  arxiv: "AX",
  research: "研",
  reading: "读",
  notes: "记",
};

function formatArchiveMonth(date: string) {
  const [year, month] = date.split("-");
  return `${year} 年 ${Number(month)} 月`;
}

export function BlogSearch({ posts, allTags }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const requestedCategory = searchParams.get("category");
  const activeCategory: ArchiveFilter = isBlogCategory(requestedCategory)
    ? requestedCategory
    : "all";
  const activeTag = searchParams.get("tag");

  const updateArchiveUrl = (category: ArchiveFilter, tag: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<BlogCategory, number> = {
      arxiv: 0,
      research: 0,
      reading: 0,
      notes: 0,
    };

    posts.forEach((post) => {
      counts[post.category] += 1;
    });
    return counts;
  }, [posts]);

  const filtered = useMemo(
    () =>
      posts.filter((post) => {
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery =
          !normalizedQuery ||
          post.title.toLowerCase().includes(normalizedQuery) ||
          post.description.toLowerCase().includes(normalizedQuery) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery));
        const matchesTag = !activeTag || post.tags?.includes(activeTag);
        const matchesCategory = activeCategory === "all" || post.category === activeCategory;
        return matchesQuery && matchesTag && matchesCategory;
      }),
    [activeCategory, activeTag, posts, query],
  );

  const monthGroups = useMemo(() => {
    const groups = new Map<string, BlogPostMeta[]>();

    filtered.forEach((post) => {
      const month = post.date.slice(0, 7);
      const group = groups.get(month) ?? [];
      group.push(post);
      groups.set(month, group);
    });

    return Array.from(groups, ([month, groupPosts]) => ({
      month,
      label: formatArchiveMonth(`${month}-01`),
      posts: groupPosts,
    }));
  }, [filtered]);

  const selectCategory = (category: ArchiveFilter) => {
    updateArchiveUrl(category, activeTag);
  };

  const selectTag = (tag: string | null) => {
    const nextTag = tag === activeTag ? null : tag;
    updateArchiveUrl(activeCategory, nextTag);
  };

  const archiveCards = [
    {
      key: "all" as const,
      label: "全部文章",
      description: "按时间浏览全部内容",
      count: posts.length,
    },
    ...BLOG_CATEGORIES.map((category) => ({
      ...category,
      count: categoryCounts[category.key],
    })),
  ];

  return (
    <>
      <section aria-label="文章分类" className="mb-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {archiveCards.map((category) => {
            const isActive = activeCategory === category.key;
            const styles = CATEGORY_STYLES[category.key];

            return (
              <button
                key={category.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectCategory(category.key)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  isActive
                    ? `${styles.active} ring-2 shadow-sm`
                    : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold ${styles.marker}`}>
                    {CATEGORY_MARKS[category.key]}
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                    {category.count}
                  </span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">{category.label}</div>
                <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {category.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <label htmlFor="blog-search" className="sr-only">
          搜索文章
        </label>
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索标题、摘要或主题..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div className="mt-4 flex items-start gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
          <span className="shrink-0 pt-1.5 text-xs font-medium text-gray-400">主题</span>
          <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto">
            <button
              type="button"
              onClick={() => selectTag(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                !activeTag
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              全部主题
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => selectTag(tag)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTag === tag
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {activeCategory === "all"
              ? "全部归档"
              : getBlogCategoryDefinition(activeCategory).label}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            找到 {filtered.length} 篇文章{activeTag ? ` · 主题：${activeTag}` : ""}
          </p>
        </div>
        {(activeCategory !== "all" || activeTag || query) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              updateArchiveUrl("all", null);
            }}
            className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            清除筛选
          </button>
        )}
      </div>

      <div className="space-y-9">
        {monthGroups.map((group) => (
          <section key={group.month} aria-labelledby={`archive-${group.month}`}>
            <div className="mb-3 flex items-center gap-3">
              <h2
                id={`archive-${group.month}`}
                className="shrink-0 text-sm font-bold tracking-wide text-gray-500 dark:text-gray-400"
              >
                {group.label}
              </h2>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs tabular-nums text-gray-400">{group.posts.length} 篇</span>
            </div>

            <div className="space-y-3">
              {group.posts.map((post) => {
                const category = getBlogCategoryDefinition(post.category);
                const styles = CATEGORY_STYLES[post.category];

                return (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                    <article
                      className={`rounded-xl border border-l-4 border-y-gray-200 border-r-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-y-gray-700 dark:border-r-gray-700 dark:bg-gray-800 ${styles.border}`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <time className="w-24 shrink-0 text-sm font-medium tabular-nums text-gray-500 dark:text-gray-400">
                          {post.date.slice(5)}
                        </time>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles.badge}`}>
                              {category.label}
                            </span>
                            <span className="text-xs text-gray-400">约 {post.readingTime} 分钟</span>
                            {post.series && (
                              <span className="truncate text-xs text-gray-400">· {post.series}</span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            {post.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                            {post.description}
                          </p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {post.tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 4 && (
                                <span className="px-1 py-0.5 text-xs text-gray-400">
                                  +{post.tags.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="hidden shrink-0 text-xl text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500 sm:block dark:text-gray-600">
                          →
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 py-16 text-center dark:border-gray-700 dark:bg-gray-800/60">
            <p className="text-gray-500 dark:text-gray-400">没有找到匹配的文章</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                updateArchiveUrl("all", null);
              }}
              className="mt-3 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              查看全部归档
            </button>
          </div>
        )}
      </div>
    </>
  );
}
