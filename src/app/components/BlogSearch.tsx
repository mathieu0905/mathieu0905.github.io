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

function formatArchiveMonth(date: string) {
  const [year, month] = date.split("-");
  return `${year} 年 ${Number(month)} 月`;
}

export function BlogSearch({ posts, allTags }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const requestedCategory = searchParams.get("category");
  const activeCategory: ArchiveFilter = isBlogCategory(requestedCategory) ? requestedCategory : "all";
  const activeTag = searchParams.get("tag");

  const updateArchiveUrl = (category: ArchiveFilter, tag: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") params.delete("category");
    else params.set("category", category);

    if (tag) params.set("tag", tag);
    else params.delete("tag");

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<BlogCategory, number> = { research: 0, reading: 0, notes: 0 };
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

  const selectCategory = (category: ArchiveFilter) => updateArchiveUrl(category, activeTag);
  const selectTag = (tag: string | null) => updateArchiveUrl(activeCategory, tag === activeTag ? null : tag);

  const hasFilter = activeCategory !== "all" || activeTag || query;

  return (
    <>
      {/* Filters: a plain text row and a hairline input, no cards */}
      <section aria-label="文章筛选" className="mb-9 border-b border-[color:var(--rule)] pb-6">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-sm">
          <button
            type="button"
            onClick={() => selectCategory("all")}
            className={`transition-colors ${
              activeCategory === "all"
                ? "font-medium text-[color:var(--ink)]"
                : "text-[color:var(--ink-faint)] hover:text-[color:var(--ink)]"
            }`}
          >
            全部 <span className="text-xs tabular-nums">{posts.length}</span>
          </button>
          {BLOG_CATEGORIES.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => selectCategory(category.key)}
              className={`transition-colors ${
                activeCategory === category.key
                  ? "font-medium text-[color:var(--ink)]"
                  : "text-[color:var(--ink-faint)] hover:text-[color:var(--ink)]"
              }`}
            >
              {category.label} <span className="text-xs tabular-nums">{categoryCounts[category.key]}</span>
            </button>
          ))}
        </div>

        <div className="mt-5">
          <label htmlFor="blog-search" className="sr-only">
            搜索文章
          </label>
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-faint)]"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="blog-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题或摘要…"
              className="w-full border-0 border-b border-[color:var(--rule)] bg-transparent py-2 pl-6 pr-2 text-sm text-[color:var(--ink)] placeholder-[color:var(--ink-faint)] focus:border-[color:var(--accent)] focus:outline-none"
            />
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowAllTags(!showAllTags)}
              aria-expanded={showAllTags}
              className="text-xs text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
            >
              主题筛选 ({allTags.length}) {showAllTags ? "▴" : "▾"}
            </button>
            {(showAllTags || activeTag) && (
              <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                {activeTag && (
                  <button
                    type="button"
                    onClick={() => selectTag(null)}
                    className="text-xs text-[color:var(--ink-faint)] underline underline-offset-4 hover:text-[color:var(--ink)]"
                  >
                    清除主题
                  </button>
                )}
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => selectTag(tag)}
                    className={`text-xs transition-colors ${
                      activeTag === tag
                        ? "font-medium text-[color:var(--ink)] underline decoration-[color:var(--accent)] underline-offset-4"
                        : "text-[color:var(--ink-faint)] hover:text-[color:var(--ink)]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <div className="mb-6 flex items-baseline justify-between gap-4 text-xs text-[color:var(--ink-faint)]">
        <span>
          {activeCategory === "all" ? "全部归档" : getBlogCategoryDefinition(activeCategory).label}
          {activeTag ? ` · ${activeTag}` : ""} · {filtered.length} 篇
        </span>
        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              updateArchiveUrl("all", null);
            }}
            className="text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
          >
            清除筛选
          </button>
        )}
      </div>

      <div className="space-y-10">
        {monthGroups.map((group) => (
          <section key={group.month} aria-labelledby={`archive-${group.month}`}>
            <h2
              id={`archive-${group.month}`}
              className="mb-4 border-b border-[color:var(--rule)] pb-2 text-xs font-medium tracking-wide text-[color:var(--ink-faint)]"
            >
              {group.label}
            </h2>
            <ul className="space-y-5">
              {group.posts.map((post) => {
                const category = getBlogCategoryDefinition(post.category);
                return (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <div className="flex items-baseline gap-3 text-xs text-[color:var(--ink-faint)]">
                        <time className="tabular-nums">{post.date.slice(5)}</time>
                        <span aria-hidden="true">·</span>
                        <span>{category.label}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.readingTime} 分钟</span>
                      </div>
                      <h3 className="mt-1 text-[1.0625rem] font-medium leading-snug text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--accent)]">
                        {post.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
                        {post.description}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="border-t border-[color:var(--rule)] py-16 text-center">
            <p className="text-sm text-[color:var(--ink-faint)]">没有找到匹配的文章</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                updateArchiveUrl("all", null);
              }}
              className="mt-3 text-sm text-[color:var(--accent)] hover:underline"
            >
              查看全部归档
            </button>
          </div>
        )}
      </div>
    </>
  );
}
