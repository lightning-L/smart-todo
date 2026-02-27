"use client";

import { useCallback } from "react";
import Link from "next/link";
import type { Task } from "@/lib/types";
import { completeTask, setScheduledAt, setDeadlineAt } from "@/lib/task-crud";
import { DateTimePickerPopover } from "./DateTimePickerPopover";

interface InboxTaskRowProps {
  task: Task;
}

function formatTime(iso: string | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function InboxTaskRow({ task }: InboxTaskRowProps) {
  const isCompleted = task.status === "completed";

  const handleComplete = useCallback(async () => {
    if (isCompleted) return;
    await completeTask(task.id);
  }, [task.id, isCompleted]);

  const handleScheduleChange = useCallback(
    (iso: string | null) => setScheduledAt(task.id, iso),
    [task.id]
  );
  const handleDeadlineChange = useCallback(
    (iso: string | null) => setDeadlineAt(task.id, iso),
    [task.id]
  );

  return (
    <div className="flex min-h-[44px] items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 transition-[border-color,background-color] hover:border-white/10 hover:bg-white/10">
      <button
        type="button"
        onClick={handleComplete}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/20 bg-transparent transition-colors hover:border-cyan-400/60 hover:bg-cyan-400/10"
        aria-label={isCompleted ? "已完成" : "完成"}
        aria-pressed={isCompleted}
      >
        {isCompleted && <span className="text-cyan-400">✓</span>}
      </button>
      <Link
        href={`/task/${task.id}`}
        className={`min-w-0 flex-1 truncate text-left hover:underline ${isCompleted ? "text-zinc-500 line-through" : "text-foreground"}`}
      >
        {task.title || "（无标题）"}
      </Link>
      {!isCompleted && (
        <div className="flex shrink-0 items-center gap-1">
          <DateTimePickerPopover
            value={task.scheduledAt}
            onChange={handleScheduleChange}
            label="安排到"
            allowClear
            trigger={
              <button
                type="button"
                className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              >
                {task.scheduledAt ? formatTime(task.scheduledAt) : "安排…"}
              </button>
            }
          />
          <DateTimePickerPopover
            value={task.deadlineAt}
            onChange={handleDeadlineChange}
            label="截止"
            allowClear
            trigger={
              <button
                type="button"
                className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              >
                {task.deadlineAt ? formatTime(task.deadlineAt) : "截止…"}
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}
