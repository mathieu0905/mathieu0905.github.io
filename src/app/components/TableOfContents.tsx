"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".prose h2, .prose h3"));
    const items: Heading[] = els.map((el) => {
      if (!el.id) {
        el.id = el.textContent?.replace(/\s+/g, "-").replace(/[^\w\u4e00-\u9fff-]/g, "").toLowerCase() || "";
      }
      return {
        id: el.id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      };
    });
    setHeadings(items);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="hidden xl:block sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        目录
      </div>
      <ul className="space-y-1 text-sm border-l-2 border-gray-200 dark:border-gray-700">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block py-1 transition-colors border-l-2 -ml-[2px] ${
                h.level === 3 ? "pl-6" : "pl-3"
              } ${
                activeId === h.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 font-medium"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
