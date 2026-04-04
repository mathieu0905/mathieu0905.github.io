"use client";

import { useState } from "react";
import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blog";

interface Props {
  posts: BlogPostMeta[];
  allTags: string[];
}

export function BlogSearch({ posts, allTags }: Props) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = posts.filter((p) => {
    const matchesQuery =
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase());
    const matchesTag = !activeTag || p.tags?.includes(activeTag);
    return matchesQuery && matchesTag;
  });

  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章..."
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTag(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !activeTag
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          全部
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTag === tag
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filtered.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
            <article className={`relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900`}>
              {/* Gradient top bar */}
              <div className={`h-1.5 bg-gradient-to-r ${post.coverColor || "from-blue-500 to-cyan-500"}`} />
              <div className="bg-white dark:bg-gray-800 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {post.date}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    · 约 {post.readingTime} 分钟
                  </span>
                  {post.series && (
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded text-xs font-medium">
                      {post.series}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {post.description}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </Link>
        ))}

        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-12">没有找到匹配的文章</p>
        )}
      </div>
    </>
  );
}
