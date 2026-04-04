import Link from 'next/link';
import { getPostContent, getPostMetadata, getSeriesPosts } from '@/lib/blog';
import { FaArrowLeft } from 'react-icons/fa6';
import { notFound } from 'next/navigation';
import GiscusComments from '@/app/components/GiscusComments';
import { EditPostButton } from '@/app/components/AdminActions';
import { MarkdownRenderer } from '@/app/components/MarkdownRenderer';
import { ReadingProgress } from '@/app/components/ReadingProgress';
import { TableOfContents } from '@/app/components/TableOfContents';
import { ShareButtons } from '@/app/components/ShareButtons';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <ReadingProgress />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8"
        >
          <FaArrowLeft /> 返回博客
        </Link>

        <div className="flex gap-8">
          {/* Main content */}
          <article className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Gradient header */}
            <div className={`h-2 bg-gradient-to-r ${post.coverColor || "from-blue-500 to-cyan-500"}`} />

            <div className="p-8">
              <header className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {post.date}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      · 约 {post.readingTime} 分钟
                    </span>
                  </div>
                  <EditPostButton slug={slug} />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {post.title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                  {post.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags?.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                  <ShareButtons title={post.title} />
                </div>
              </header>

              <div className="prose prose-blue dark:prose-invert max-w-none">
                <MarkdownRenderer content={post.content} />
              </div>
            </div>
          </article>

          {/* Sidebar: TOC */}
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <TableOfContents />
          </aside>
        </div>

        {/* Series navigation */}
        {post.series && seriesPosts.length > 1 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              📚 系列：{post.series}
            </h3>
            <div className="space-y-2">
              {seriesPosts.map((sp) => (
                <Link
                  key={sp.slug}
                  href={`/blog/${sp.slug}`}
                  className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                    sp.slug === slug
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="text-xs text-gray-400 mr-2">{sp.date}</span>
                  {sp.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <GiscusComments />
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostContent(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: `${post.title} | Zhihao Lin`,
    description: post.description,
  };
}
