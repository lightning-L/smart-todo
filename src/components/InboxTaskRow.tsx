"use client";

import { useCallback } from "react";
import Link from "next/link";
import type { Task } from "@/lib/types";
import { completeTask, setScheduledAt, setDeadlineAt } from "@/lib/task-crud";
import { DateTimePickerPopover, formatDateTimeDisplay } from "./DateTimePickerPopover";

type FromPage = "inbox" | "all";

interface InboxTaskRowProps {
  task: Task;
  from?: FromPage;
}

export function InboxTaskRow({ task, from }: InboxTaskRowProps) {
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
    <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm transition-all duration-200 hover:border-slate-300/80 hover:shadow-md">
      <button
        type="button"
        onClick={handleComplete}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 bg-white transition-colors hover:border-cyan-500 hover:bg-cyan-50"
        aria-label={isCompleted ? "已完成" : "完成"}
        aria-pressed={isCompleted}
      >
        {isCompleted && <span className="text-cyan-600">✓</span>}
      </button>
      <Link
        href={from ? `/task/${task.id}?from=${from}` : `/task/${task.id}`}
        className={`min-w-0 flex-1 truncate text-left font-medium hover:underline ${isCompleted ? "text-slate-500 line-through" : "text-slate-800"}`}
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
                className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {task.scheduledAt ? formatDateTimeDisplay(task.scheduledAt) : "安排…"}
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
                className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {task.deadlineAt ? formatDateTimeDisplay(task.deadlineAt) : "截止…"}
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}
