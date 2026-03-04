"use client";

import * as Popover from "@radix-ui/react-popover";
import { useAuth } from "@/contexts/AuthContext";

function AvatarTrigger({
  src,
  initial,
  isLoggedIn,
}: {
  src?: string | null;
  initial: string;
  isLoggedIn: boolean;
}) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200/80 bg-white text-sm font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow ${
        !isLoggedIn ? "bg-slate-100 text-slate-400" : "text-cyan-700"
      }`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          width={36}
          height={36}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        initial
      )}
    </span>
  );
}

export function ProfileButton() {
  const { session, isLoading, signIn, signOut } = useAuth();

  if (isLoading) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <span className="text-xs">…</span>
      </span>
    );
  }

  const user = session?.user;
  const email = user?.email ?? "";
  const initial = email ? email[0].toUpperCase() : "?";
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined);

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => signIn()}
        className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow"
      >
        登录
      </button>
    );
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="rounded-full outline-none ring-cyan-500/50 focus-visible:ring-2"
          aria-label="打开账户菜单"
        >
          <AvatarTrigger
            src={avatarUrl}
            initial={initial}
            isLoggedIn={!!user}
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="end"
          className="z-50 w-64 rounded-xl border border-slate-200/80 bg-white p-0 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="border-b border-slate-200/80 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-slate-900" title={email}>
              {email || "已登录"}
            </p>
            <p className="text-xs text-slate-500">已登录</p>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && "toast" in window) {
                  (window as unknown as { toast: (m: string) => void }).toast?.("敬请期待");
                }
              }}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              账号设置
            </button>
            <div className="my-1 h-px bg-slate-200/80" />
            <button
              type="button"
              onClick={() => signOut()}
              className="w-full px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              登出
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
