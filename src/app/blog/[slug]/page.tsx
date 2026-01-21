import Link from 'next/link';
import { getPostContent } from '@/lib/blog';
import ReactMarkdown from 'react-markdown';
import { FaArrowLeft } from 'react-icons/fa6';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostContent(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8"
        >
          <FaArrowLeft /> Back to Blog
        </Link>

        <article className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <header className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
              {post.date}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {post.description}
            </p>
          </header>

          <div className="prose prose-blue dark:prose-invert max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostContent(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | Zhihao Lin`,
    description: post.description,
  };
}
