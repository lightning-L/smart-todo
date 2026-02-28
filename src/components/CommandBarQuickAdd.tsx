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
    <form onSubmit={handleSubmit} className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="添加任务，回车创建"
        className="w-full rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 text-base text-slate-900 shadow-sm placeholder:text-slate-400 transition-shadow focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_0_3px_rgba(8,145,178,0.12)]"
        aria-label="快速添加任务"
      />
    </form>
  );
}
