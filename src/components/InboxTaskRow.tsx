"use client";

import { useCallback } from "react";
import Link from "next/link";
import type { Task } from "@/lib/types";
import { completeTask, undoCompleteTask } from "@/lib/task-crud";
import { TaskTypeIcon } from "./TaskTypeIcon";

type FromPage = "inbox" | "all";

interface InboxTaskRowProps {
  task: Task;
  from?: FromPage;
}

export function InboxTaskRow({ task, from }: InboxTaskRowProps) {
  const isCompleted = task.status === "completed";

  const handleComplete = useCallback(async () => {
    if (isCompleted) await undoCompleteTask(task.id);
    else await completeTask(task.id);
  }, [task.id, isCompleted]);

  return (
    <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm transition-all duration-200 hover:border-slate-300/80 hover:shadow-md">
      <button
        type="button"
        onClick={handleComplete}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 bg-white transition-colors hover:border-cyan-500 hover:bg-cyan-50"
        aria-label={isCompleted ? "撤销完成" : "完成"}
        aria-pressed={isCompleted}
      >
        {isCompleted && <span className="text-cyan-600">✓</span>}
      </button>
      <TaskTypeIcon type={task.type} />
      <Link
        href={from ? `/task/${task.id}?from=${from}` : `/task/${task.id}`}
        className={`min-w-0 flex-1 truncate text-left font-medium hover:underline ${isCompleted ? "text-slate-500 line-through" : "text-slate-800"}`}
      >
        {task.title || "（无标题）"}
      </Link>
    </div>
  );
}
