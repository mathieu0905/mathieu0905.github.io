"use client";

import Link from "next/link";
import { FaPlus, FaPen } from "react-icons/fa6";

export function NewPostButton() {
  return (
    <Link
      href="/admin?action=new"
      aria-label="新建文章"
      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 sm:px-4"
    >
      <FaPlus className="text-xs" /> <span className="hidden sm:inline">New Post</span>
    </Link>
  );
}

export function EditPostButton({ slug }: { slug: string }) {
  return (
    <Link
      href={`/admin?action=edit&slug=${slug}`}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
    >
      <FaPen className="text-xs" /> Edit
    </Link>
  );
}
