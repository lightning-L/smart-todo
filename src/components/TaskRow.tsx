"use client";

import { useCallback } from "react";
import Link from "next/link";
import type { Task } from "@/lib/types";
import { completeTask } from "@/lib/task-crud";

interface TaskRowProps {
  task: Task;
  showTime?: boolean;
  progress?: { completed: number; total: number };
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function TaskRow({ task, showTime = false, progress }: TaskRowProps) {
  const isCompleted = task.status === "completed";

  const handleToggle = useCallback(async () => {
    if (isCompleted) return;
    await completeTask(task.id);
  }, [task.id, isCompleted]);

  const timeStr = task.scheduledAt ? formatTime(task.scheduledAt) : "";

  return (
    <div
      className="flex min-h-[44px] items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm transition-all duration-200 hover:border-slate-300/80 hover:shadow-md"
      data-task-id={task.id}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 bg-white transition-colors hover:border-cyan-500 hover:bg-cyan-50"
        aria-label={isCompleted ? "已完成" : "完成"}
        aria-pressed={isCompleted}
      >
        {isCompleted && (
          <span className="text-cyan-600" aria-hidden>
            ✓
          </span>
        )}
      </button>
      {showTime && (
        <span className="w-14 shrink-0 text-xs tabular-nums text-slate-500">
          {timeStr || "—"}
        </span>
      )}
      <Link
        href={`/task/${task.id}`}
        className={`min-w-0 flex-1 truncate text-left font-medium hover:underline ${isCompleted ? "text-slate-500 line-through" : "text-slate-800"}`}
      >
        {task.title || "（无标题）"}
        {progress && progress.total > 0 && (
          <span className="ml-1 font-normal text-slate-500">
            {progress.completed}/{progress.total}
          </span>
        )}
      </Link>
    </div>
  );
}
