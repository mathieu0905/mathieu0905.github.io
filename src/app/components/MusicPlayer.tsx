"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FaMusic, FaXmark } from "react-icons/fa6";

const NETEASE_PLAYLIST_ID = "10131111456";

/**
 * The player mounts into a host element on `document.body` so a Next.js route
 * change does not unmount it and cut the music. It starts collapsed and silent:
 * autoplay on load is intrusive on a reading page.
 */

let playerInitialized = false;

function initPlayer(host: HTMLDivElement) {
  if (playerInitialized) return;
  playerInitialized = true;

  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "https://cdn.jsdelivr.net/npm/aplayer@1/dist/APlayer.min.css";
  document.head.appendChild(css);

  const aplayerScript = document.createElement("script");
  aplayerScript.src = "https://cdn.jsdelivr.net/npm/aplayer@1/dist/APlayer.min.js";
  aplayerScript.onload = () => {
    const metingScript = document.createElement("script");
    metingScript.src = "https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js";
    metingScript.onload = () => {
      const el = document.createElement("meting-js");
      el.setAttribute("server", "netease");
      el.setAttribute("type", "playlist");
      el.setAttribute("id", NETEASE_PLAYLIST_ID);
      el.setAttribute("autoplay", "false");
      el.setAttribute("fixed", "false");
      el.setAttribute("mini", "false");
      el.setAttribute("listFolded", "true");
      el.setAttribute("listMaxHeight", "220px");
      el.setAttribute("preload", "none");
      el.setAttribute("volume", "0.5");
      el.setAttribute("order", "list");
      el.setAttribute("theme", "#1f5fa0");
      host.appendChild(el);
    };
    document.head.appendChild(metingScript);
  };
  document.head.appendChild(aplayerScript);
}

export default function MusicPlayer() {
  const pathname = usePathname();
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mount the player host lazily, only after the visitor asks for it.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!isOpen || !wrapper) return;

    let host = document.getElementById("music-player-host") as HTMLDivElement | null;
    if (!host) {
      host = document.createElement("div");
      host.id = "music-player-host";
      document.body.appendChild(host);
    }
    if (!wrapper.contains(host)) wrapper.appendChild(host);
    initPlayer(host);
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[300px] overflow-hidden rounded-xl border border-[color:var(--rule)] bg-[color:var(--paper-raised)] shadow-lg shadow-black/5">
          <div className="flex items-center justify-between border-b border-[color:var(--rule)] px-3 py-2">
            <span className="text-xs font-medium tracking-wide text-[color:var(--ink-soft)]">
              {isEnglish ? "Music" : "音乐"}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
              aria-label={isEnglish ? "Close music player" : "关闭播放器"}
            >
              <FaXmark className="text-xs" />
            </button>
          </div>
          <div ref={wrapperRef} className="px-1.5 py-1.5" />
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--rule)] bg-[color:var(--paper-raised)] text-[color:var(--ink-faint)] shadow-sm transition-colors hover:text-[color:var(--ink)]"
          aria-label={isEnglish ? "Open music player" : "打开音乐播放器"}
          title={isEnglish ? "Music" : "音乐"}
        >
          <FaMusic className="text-sm" />
        </button>
      )}
    </>
  );
}
