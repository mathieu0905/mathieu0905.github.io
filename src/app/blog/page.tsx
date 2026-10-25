import { Suspense } from "react";
import { getPostMetadata, getAllTags } from "@/lib/blog";
import { BlogSearch } from "@/app/components/BlogSearch";

export default function BlogIndex() {
  const posts = getPostMetadata();
  const allTags = getAllTags();

  return (
    <div className="site-shell">
      <main className="site-container py-14 pb-24">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-[2rem]">博客</h1>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
            研究心得、论文解读与技术探索。
          </p>
          <a
            href="https://ai-frontier-brief-2026.mathieulin0905.chatgpt.site/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-baseline gap-1.5 text-sm text-[color:var(--accent)] hover:underline"
          >
            AI Frontier Brief 2026 — 每周技术报告 <span aria-hidden="true">↗</span>
          </a>
        </header>

        <Suspense fallback={<div className="h-40" />}>
          <BlogSearch posts={posts} allTags={allTags} />
        </Suspense>
      </main>
    </div>
  );
}
