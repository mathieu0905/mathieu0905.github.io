import Link from "next/link";
import { getPostContent, getPostMetadata, getSeriesPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import GiscusComments from "@/app/components/GiscusComments";
import { EditPostButton } from "@/app/components/AdminActions";
import { MarkdownRenderer } from "@/app/components/MarkdownRenderer";
import { ReadingProgress } from "@/app/components/ReadingProgress";
import { TableOfContents } from "@/app/components/TableOfContents";
import { ShareButtons } from "@/app/components/ShareButtons";
import { getBlogCategoryDefinition } from "@/lib/blogCategories";

export async function generateStaticParams() {
  const posts = getPostMetadata();
  return posts.map((post) => ({ slug: post.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostContent(slug);

  if (!post) {
    notFound();
  }

  const seriesPosts = post.series ? getSeriesPosts(post.series) : [];
  const category = getBlogCategoryDefinition(post.category);
  const seriesIndex = seriesPosts.findIndex((item) => item.slug === slug);

  return (
    <div className="site-shell">
      <ReadingProgress />
      <main className="mx-auto flex max-w-[75rem] gap-12 px-6 py-12 pb-24 md:px-8">
        <div className="mx-auto min-w-0 max-w-3xl flex-1">
          <Link
            href="/blog"
            className="text-xs text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
          >
            ← 博客
          </Link>

          <article className="mt-7">
            <header className="border-b border-[color:var(--rule)] pb-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[color:var(--ink-faint)]">
                <time className="tabular-nums">{post.date}</time>
                <span aria-hidden="true">·</span>
                <Link
                  href={`/blog?category=${post.category}`}
                  className="transition-colors hover:text-[color:var(--ink)]"
                >
                  {category.label}
                </Link>
                <span aria-hidden="true">·</span>
                <span>{post.readingTime} 分钟阅读</span>
                {post.series && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{post.series}</span>
                  </>
                )}
              </div>

              <h1 className="mt-4 text-[1.9rem] font-semibold leading-[1.25] tracking-tight text-[color:var(--ink)] sm:text-[2.2rem]">
                {post.title}
              </h1>

              {post.description && (
                <p className="mt-4 text-[1.0625rem] leading-relaxed text-[color:var(--ink-soft)]">
                  {post.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
                  {post.tags?.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--accent)]"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <ShareButtons title={post.title} />
                  <EditPostButton slug={slug} />
                </div>
              </div>
            </header>

            <div className="prose max-w-none pt-8">
              <MarkdownRenderer content={post.content} />
            </div>
          </article>

          {/* Series navigation */}
          {post.series && seriesPosts.length > 1 && (
            <nav className="mt-14 border-t border-[color:var(--rule)] pt-6">
              <h2 className="mb-3 text-xs font-medium tracking-wide text-[color:var(--ink-faint)]">
                系列 · {post.series}（{seriesIndex + 1}/{seriesPosts.length}）
              </h2>
              <ol className="space-y-1.5 text-sm">
                {seriesPosts.map((seriesPost, index) => (
                  <li key={seriesPost.slug} className="flex gap-3">
                    <span className="w-4 flex-shrink-0 font-mono text-xs leading-6 text-[color:var(--ink-faint)]">
                      {index + 1}
                    </span>
                    <Link
                      href={`/blog/${seriesPost.slug}`}
                      className={
                        seriesPost.slug === slug
                          ? "font-medium text-[color:var(--ink)]"
                          : "text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--accent)]"
                      }
                    >
                      {seriesPost.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="mt-14 border-t border-[color:var(--rule)] pt-8">
            <GiscusComments />
          </div>
        </div>

        {/* Sidebar TOC: wide screens only */}
        <aside className="hidden w-56 flex-shrink-0 xl:block">
          <TableOfContents />
        </aside>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostContent(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | Zhihao Lin`,
    description: post.description,
  };
}
