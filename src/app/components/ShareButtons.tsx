"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function ShareButtons({ title }: { title: string }) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Build the absolute share URL after mount so server output stays stable.
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(`${window.location.origin}${pathname}`);
  }, [pathname]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setShowTip(true);
      setTimeout(() => setShowTip(false), 2400);
    }
  };

  return (
    <div className="relative flex items-center gap-3 text-xs">
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
        title="分享到 X"
      >
        分享
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
        title="复制链接"
      >
        {copied ? "已复制" : "复制链接"}
      </button>
      {showTip && (
        <span className="absolute right-0 top-6 whitespace-nowrap rounded bg-[color:var(--ink)] px-2 py-1 text-[11px] text-[color:var(--paper)]">
          请手动复制地址栏链接
        </span>
      )}
    </div>
  );
}
