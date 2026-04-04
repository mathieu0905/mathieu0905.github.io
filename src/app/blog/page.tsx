import { getPostMetadata, getAllTags } from '@/lib/blog';
import { BlogSearch } from '@/app/components/BlogSearch';
import { NewPostButton } from '@/app/components/AdminActions';

export default function BlogIndex() {
  const posts = getPostMetadata();
  const allTags = getAllTags();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">博客</h1>
            <NewPostButton />
          </div>
          <p className="text-gray-600 dark:text-gray-400">研究心得、论文解读与技术探索</p>
        </div>

        <BlogSearch posts={posts} allTags={allTags} />
      </main>
    </div>
  );
}
