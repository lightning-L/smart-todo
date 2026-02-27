"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MonthCalendar } from "./MonthCalendar";

const navItems = [
  { href: "/", label: "日历" },
  { href: "/all", label: "全部" },
  { href: "/inbox", label: "收件箱" },
] as const;

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5">
      {navItems.map(({ href, label }) => {
        const isActive =
          pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/30"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile: top bar + hamburger */}
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-black/20 px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          aria-label="打开菜单"
          aria-expanded={drawerOpen}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="text-sm font-medium text-foreground">
          {pathname === "/" ? "日历" : pathname === "/all" ? "全部" : pathname === "/inbox" ? "收件箱" : "任务"}
        </span>
      </header>

      {/* Mobile: overlay when drawer open */}
      {drawerOpen && (
        <button
          type="button"
          aria-label="关闭菜单"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Mobile: drawer */}
      <aside
        className="fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col gap-4 border-r border-white/10 bg-zinc-900/95 p-4 shadow-xl backdrop-blur transition-transform duration-200 ease-out md:hidden"
        style={{
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        aria-modal={drawerOpen}
        aria-hidden={!drawerOpen}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-sm font-medium text-foreground">菜单</span>
          <button
            type="button"
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
            aria-label="关闭菜单"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <NavLinks pathname={pathname} onNavigate={closeDrawer} />
        <MonthCalendar />
      </aside>

      {/* Desktop: always-visible sidebar */}
      <aside className="hidden w-[300px] shrink-0 flex-col gap-4 border-r border-white/10 bg-black/20 p-3 md:flex">
        <NavLinks pathname={pathname} />
        <MonthCalendar />
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
