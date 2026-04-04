"use client";

import { usePathname } from "next/navigation";

export function ShareButtons({ title }: { title: string }) {
  const pathname = usePathname();

  const url = typeof window !== "undefined"
    ? `${window.location.origin}${pathname}`
    : pathname;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("链接已复制！");
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">分享：</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-gray-600 dark:text-gray-300 text-sm"
        title="Share on Twitter"
      >
        𝕏
      </a>
      <button
        onClick={copyLink}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900 transition-colors text-gray-600 dark:text-gray-300 text-sm"
        title="复制链接"
      >
        🔗
      </button>
    </div>
  );
}
