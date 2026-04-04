"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { label: string; href: string };

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const locale = pathname.startsWith("/en") ? "en" : "zh";

  const items: NavItem[] =
    locale === "en"
      ? [
          { label: "Home", href: "/en" },
          { label: "Blog", href: "/blog" },
          { label: "Papers", href: "/en/papers" },
        ]
      : [
          { label: "首页", href: "/" },
          { label: "博客", href: "/blog" },
          { label: "论文 PDF", href: "/papers" },
        ];

  const langSwitch =
    locale === "en"
      ? { label: "中文", href: "/" }
      : { label: "EN", href: "/en" };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <Link
          href={locale === "en" ? "/en" : "/"}
          className="font-bold text-gray-900 dark:text-white text-lg"
        >
          {locale === "en" ? "Zhihao Lin" : "林智灏"}
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  active
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-medium"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <span className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
          <Link
            href={langSwitch.href}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            {langSwitch.label}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-gray-600 dark:text-gray-300"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 space-y-1">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={langSwitch.href}
            className="block px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400"
          >
            {langSwitch.label}
          </Link>
        </div>
      )}
    </nav>
  );
}
