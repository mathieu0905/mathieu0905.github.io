import Link from 'next/link';
import { getPostMetadata } from '@/lib/blog';
import { FaArrowLeft } from 'react-icons/fa6';

export default function BlogIndex() {
  const posts = getPostMetadata();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4">
             <FaArrowLeft /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Blog</h1>
          <p className="text-gray-600 dark:text-gray-400">Thoughts, updates, and experiments.</p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900">
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {post.date}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {post.description}
                  </p>
                </div>
              </article>
            </Link>
          ))}

          {posts.length === 0 && (
            <p className="text-gray-500 text-center py-12">No posts found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
