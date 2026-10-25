"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { label: string; href: string };

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "zh";

  // The mobile sheet closes on navigation via the link handlers below, which
  // avoids a cascading render from an effect keyed on the pathname.

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
          { label: "论文", href: "/papers" },
        ];

  const langSwitch =
    locale === "en"
      ? { label: "中文", href: pathname.replace(/^\/en/, "") || "/" }
      : { label: "EN", href: pathname === "/papers" ? "/en/papers" : "/en" };

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && href !== "/en" && pathname.startsWith(`${href}/`));

  return (
    <nav className="sticky top-0 z-50 border-b border-[color:var(--rule)] bg-[color:var(--paper)]/85 backdrop-blur-md">
      <div className="site-container-wide flex h-16 items-center justify-between">
        <Link
          href={locale === "en" ? "/en" : "/"}
          className="text-[15px] font-semibold tracking-tight text-[color:var(--ink)] transition-opacity hover:opacity-70"
        >
          {locale === "en" ? "Zhihao Lin" : "林智灏"}
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                isActive(item.href)
                  ? "font-medium text-[color:var(--ink)]"
                  : "text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <span className="mx-2 h-4 w-px bg-[color:var(--rule)]" />
          <Link
            href={langSwitch.href}
            className="rounded-md px-3 py-1.5 text-sm text-[color:var(--ink-faint)] transition-colors hover:text-[color:var(--ink)]"
          >
            {langSwitch.label}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="-mr-2 p-2 text-[color:var(--ink-soft)] md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[color:var(--rule)] bg-[color:var(--paper)] px-6 py-3 md:hidden">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block rounded-md px-2 py-2.5 text-sm ${
                isActive(item.href)
                  ? "font-medium text-[color:var(--ink)]"
                  : "text-[color:var(--ink-soft)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={langSwitch.href}
            onClick={() => setOpen(false)}
            className="block border-t border-[color:var(--rule)] px-2 py-2.5 text-sm text-[color:var(--ink-faint)]"
          >
            {langSwitch.label}
          </Link>
        </div>
      )}
    </nav>
  );
}
