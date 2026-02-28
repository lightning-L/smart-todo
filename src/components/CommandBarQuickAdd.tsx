"use client";

import { useState, useCallback } from "react";
import { createTask } from "@/lib/task-crud";

export function CommandBarQuickAdd() {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const title = value.trim();
      if (!title) return;
      await createTask({ title });
      setValue("");
    },
    [value]
  );

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="添加任务，回车创建"
        className="min-w-0 flex-1 rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 text-base text-slate-900 shadow-sm placeholder:text-slate-400 transition-shadow focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_0_3px_rgba(8,145,178,0.12)]"
        aria-label="快速添加任务"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm transition-colors hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-600 disabled:opacity-40 disabled:hover:border-slate-200/80 disabled:hover:bg-white disabled:hover:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25"
        aria-label="添加任务"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </form>
  );
}
