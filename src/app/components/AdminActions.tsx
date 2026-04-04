"use client";

import Link from "next/link";
import { FaPlus, FaPen } from "react-icons/fa6";

export function NewPostButton() {
  return (
    <Link
      href="/admin?action=new"
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
    >
      <FaPlus className="text-xs" /> New Post
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
