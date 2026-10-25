import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-shell">
      <main className="site-container flex min-h-[60vh] flex-col justify-center py-24">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--ink-faint)]">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--ink)]">
          这个页面不存在
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
          链接可能已经过期，或者文章被重命名了。
        </p>
        <div className="mt-6 flex items-baseline gap-5 text-sm">
          <Link href="/" className="text-[color:var(--accent)] hover:underline">
            返回首页
          </Link>
          <Link href="/blog" className="text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]">
            浏览博客
          </Link>
        </div>
      </main>
    </div>
  );
}
