import { Suspense } from 'react';
import { getPostMetadata, getAllTags } from '@/lib/blog';
import { BlogSearch } from '@/app/components/BlogSearch';
import { NewPostButton } from '@/app/components/AdminActions';

export default function BlogIndex() {
  const posts = getPostMetadata();
  const allTags = getAllTags();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <main className="max-w-5xl mx-auto px-6 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">博客归档</h1>
            <NewPostButton />
          </div>
          <p className="text-gray-600 dark:text-gray-400">按内容类型与时间整理研究心得、论文解读和技术探索</p>
        </div>

        <a
          href="https://ai-frontier-brief-2026.mathieulin0905.chatgpt.site/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative mb-8 block overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-900 p-6 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl sm:p-7"
        >
          <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-cyan-400/15 blur-2xl transition-transform group-hover:scale-110" />
          <div className="absolute -bottom-20 right-32 h-44 w-44 rounded-full bg-violet-400/15 blur-2xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-blue-200">
                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1">
                  每周技术报告
                </span>
                <span>外部专栏</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Frontier Brief 2026</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                查看我的每周技术报告，持续整理 AI 前沿进展、关键论文与技术趋势。
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition-transform group-hover:translate-x-1 sm:self-auto">
              前往周报
              <span aria-hidden="true">↗</span>
            </span>
          </div>
        </a>

        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/70 dark:bg-gray-800/70" />}>
          <BlogSearch posts={posts} allTags={allTags} />
        </Suspense>
      </main>
    </div>
  );
}
