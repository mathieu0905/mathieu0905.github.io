"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-14 left-0 right-0 z-40 h-0.5 bg-gray-200/50 dark:bg-gray-700/50">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
