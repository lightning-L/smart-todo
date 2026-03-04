"use client";

import { useAuth } from "@/contexts/AuthContext";

export function AuthUI() {
  const { session, isLoading, signIn, signOut } = useAuth();

  if (isLoading) {
    return (
      <span className="text-xs text-slate-500">加载中…</span>
    );
  }

  if (session?.user) {
    return (
      <div className="flex flex-col gap-1">
        <span className="truncate text-xs text-slate-600" title={session.user.email ?? undefined}>
          {session.user.email ?? "已登录"}
        </span>
        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
        >
          登出
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn()}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow"
    >
      使用 Google 登录
    </button>
  );
}
