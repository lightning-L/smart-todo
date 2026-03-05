"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ProfileButton } from "./ProfileButton";

const MonthCalendar = dynamic(
  () => import("./MonthCalendar").then((m) => m.MonthCalendar),
  { ssr: false }
);

const navItems = [
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
        const isActive = pathname === href || pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-white text-cyan-700 shadow-sm ring-1 ring-cyan-200"
                : "text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm"
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
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
        </div>
        <ProfileButton />
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
        className="fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col gap-4 border-r border-slate-200/80 bg-white p-4 shadow-xl transition-transform duration-200 ease-out md:hidden"
        style={{
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        aria-modal={drawerOpen}
        aria-hidden={!drawerOpen}
      >
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <span className="text-sm font-semibold text-slate-800">菜单</span>
          <button
            type="button"
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
      <aside className="hidden w-[300px] shrink-0 flex-col gap-4 border-r border-slate-200/80 bg-slate-50/80 p-4 md:flex">
        <NavLinks pathname={pathname} />
        <MonthCalendar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden shrink-0 items-center justify-end border-b border-slate-200/80 bg-white/80 px-4 py-2 shadow-sm backdrop-blur md:flex">
          <ProfileButton />
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
