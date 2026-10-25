"use client";

import Link from "next/link";
import { FaPlus, FaPen } from "react-icons/fa6";

export function NewPostButton() {
  return (
    <Link
      href="/admin?action=new"
      aria-label="新建文章"
      className="inline-flex flex-shrink-0 items-center gap-1.5 text-xs text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
    >
      <FaPlus className="text-[10px]" /> 新建
    </Link>
  );
}

export function EditPostButton({ slug }: { slug: string }) {
  return (
    <Link
      href={`/admin?action=edit&slug=${slug}`}
      className="inline-flex items-center gap-1.5 text-xs text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
      title="编辑这篇文章"
    >
      <FaPen className="text-[10px]" /> 编辑
    </Link>
  );
}
