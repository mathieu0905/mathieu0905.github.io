"use client";

import { useEffect, useRef, useState } from "react";
import { FaMusic, FaChevronDown, FaCompactDisc } from "react-icons/fa6";

// 你的网易云歌单 ID
const NETEASE_PLAYLIST_ID = "10131111456";

/**
 * 播放器通过 DOM API 把 meting-js 元素挂到 document.body 的一个固定容器里，
 * 而不是挂在 React 树中。这样 Next.js 页面跳转时播放器不会被卸载，音乐不中断。
 */

function getOrCreateHost(): HTMLDivElement {
  let host = document.getElementById("music-player-host") as HTMLDivElement;
  if (!host) {
    host = document.createElement("div");
    host.id = "music-player-host";
    document.body.appendChild(host);
  }
  return host;
}

let playerInitialized = false;

function initPlayer() {
  if (playerInitialized) return;
  playerInitialized = true;

  const host = getOrCreateHost();

  // APlayer CSS
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "https://cdn.jsdelivr.net/npm/aplayer@1/dist/APlayer.min.css";
  document.head.appendChild(css);

  // APlayer JS -> MetingJS -> 插入 meting-js
  const aplayerScript = document.createElement("script");
  aplayerScript.src =
    "https://cdn.jsdelivr.net/npm/aplayer@1/dist/APlayer.min.js";
  aplayerScript.onload = () => {
    const metingScript = document.createElement("script");
    metingScript.src =
      "https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js";
    metingScript.onload = () => {
      const el = document.createElement("meting-js");
      el.setAttribute("server", "netease");
      el.setAttribute("type", "playlist");
      el.setAttribute("id", NETEASE_PLAYLIST_ID);
      el.setAttribute("autoplay", "true");
      el.setAttribute("fixed", "false");
      el.setAttribute("mini", "false");
      el.setAttribute("listFolded", "false");
      el.setAttribute("listMaxHeight", "250px");
      el.setAttribute("preload", "auto");
      el.setAttribute("volume", "0.5");
      el.setAttribute("order", "list");
      el.setAttribute("theme", "#a855f7");
      host.appendChild(el);
    };
    document.head.appendChild(metingScript);
  };
  document.head.appendChild(aplayerScript);
}

export default function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 初始化播放器（只执行一次，挂在 body 上不会随页面跳转卸载）
  useEffect(() => {
    initPlayer();
  }, []);

  // 把 body 上的播放器 DOM 移到当前 wrapper 里显示
  useEffect(() => {
    const host = document.getElementById("music-player-host");
    const wrapper = wrapperRef.current;
    if (host && wrapper && !wrapper.contains(host)) {
      wrapper.appendChild(host);
    }
  });

  return (
    <>
      {/* Player panel — 收起时滑出屏幕，不卸载 */}
      <div
        className={`fixed z-50 w-[320px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-500/10 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-300 ${
          isOpen
            ? "bottom-6 right-6 opacity-100"
            : "bottom-6 -right-[400px] opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <FaCompactDisc className="text-purple-500 animate-spin-slow" />
            我的音乐
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="收起播放器"
          >
            <FaChevronDown className="text-gray-400 text-sm" />
          </button>
        </div>

        {/* 播放器挂载点 */}
        <div ref={wrapperRef} className="px-2 pb-2" />
      </div>

      {/* Floating vinyl button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 group transition-all duration-300 ${
          isOpen
            ? "scale-0 opacity-0 pointer-events-none"
            : "scale-100 opacity-100"
        }`}
        aria-label="打开音乐播放器"
      >
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 flex items-center justify-center transition-transform hover:scale-110 animate-spin-slow">
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white/80" />
          </div>
          <FaMusic className="absolute text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="absolute -top-1 -right-1 flex gap-[2px]">
          <span className="w-1 h-3 bg-green-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1 h-4 bg-green-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </button>
    </>
  );
}
