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
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-foreground placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
        aria-label="快速添加任务"
      />
    </form>
  );
}
