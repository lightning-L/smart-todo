"use client";

import { useCallback } from "react";
import Link from "next/link";
import type { Task } from "@/lib/types";
import { completeTask, undoCompleteTask } from "@/lib/task-crud";
import { TaskTypeIcon } from "./TaskTypeIcon";

type FromPage = "all" | "calendar" | "inbox";

interface TaskRowProps {
  task: Task;
  showTime?: boolean;
  progress?: { completed: number; total: number };
  from?: FromPage;
  /** 自定义勾选行为（如每日区块中「今天完成」）；未传则默认为整条任务完成 */
  onToggle?: (task: Task) => void | Promise<void>;
  /** 与 onToggle 搭配使用，表示勾的选中状态（如今天已记录） */
  checked?: boolean;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function TaskRow({ task, showTime = false, progress, from, onToggle, checked }: TaskRowProps) {
  const isCompleted = task.status === "completed";
  const useCustomToggle = onToggle != null;
  const showChecked = useCustomToggle ? !!checked : isCompleted;

  const handleToggle = useCallback(async () => {
    if (useCustomToggle) {
      await onToggle(task);
    } else {
      if (isCompleted) await undoCompleteTask(task.id);
      else await completeTask(task.id);
    }
  }, [task, useCustomToggle, onToggle, isCompleted]);

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
        aria-label={showChecked ? "撤销完成" : "完成"}
        aria-pressed={showChecked}
        disabled={useCustomToggle && showChecked}
      >
        {showChecked && (
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
      <TaskTypeIcon type={task.type} />
      <Link
        href={from ? `/task/${task.id}?from=${from}` : `/task/${task.id}`}
        className={`min-w-0 flex-1 truncate text-left font-medium hover:underline ${showChecked ? "text-slate-500 line-through" : "text-slate-800"}`}
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
