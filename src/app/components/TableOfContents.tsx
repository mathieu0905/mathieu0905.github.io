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
    const frame = requestAnimationFrame(() => {
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
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--ink-faint)]">
        目录
      </div>
      <ul className="space-y-1.5 border-l border-[color:var(--rule)] text-[13px] leading-snug">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "hidden 2xl:block" : ""}>
            <a
              href={`#${h.id}`}
              className={`-ml-px block border-l py-0.5 pl-3 pr-1 transition-colors ${
                h.level === 3 ? "ml-3" : ""
              } ${
                activeId === h.id
                  ? "border-[color:var(--accent)] text-[color:var(--ink)]"
                  : "border-transparent text-[color:var(--ink-faint)] hover:text-[color:var(--ink-soft)]"
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
