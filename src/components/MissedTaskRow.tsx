"use client";

import { useCallback } from "react";
import Link from "next/link";
import { startOfDay, format, parseISO } from "date-fns";
import type { Task } from "@/lib/types";
import { setScheduledAt, completeTask } from "@/lib/task-crud";
import { DateTimePickerPopover, formatDateTimeDisplay } from "./DateTimePickerPopover";

interface MissedTaskRowProps {
  task: Task;
  from?: "all";
}

function formatTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return "";
  }
}

export function MissedTaskRow({ task, from }: MissedTaskRowProps) {
  const isCompleted = task.status === "completed";

  const doToday = useCallback(async () => {
    const today = startOfDay(new Date());
    await setScheduledAt(task.id, today.toISOString());
  }, [task.id]);

  const unschedule = useCallback(async () => {
    await setScheduledAt(task.id, null);
  }, [task.id]);

  const handleScheduleChange = useCallback(
    (iso: string | null) => setScheduledAt(task.id, iso),
    [task.id]
  );

  const handleComplete = useCallback(async () => {
    if (!isCompleted) await completeTask(task.id);
  }, [task.id, isCompleted]);

  return (
    <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md">
      <button
        type="button"
        onClick={handleComplete}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 bg-white"
        aria-pressed={isCompleted}
      >
        {isCompleted && <span className="text-cyan-600">✓</span>}
      </button>
      <span className="w-14 shrink-0 text-xs tabular-nums text-slate-500">
        {task.scheduledAt ? formatTime(task.scheduledAt) : "—"}
      </span>
      <Link
        href={from ? `/task/${task.id}?from=${from}` : `/task/${task.id}`}
        className={`min-w-0 flex-1 truncate font-medium hover:underline ${isCompleted ? "text-slate-500 line-through" : "text-slate-800"}`}
      >
        {task.title || "（无标题）"}
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={doToday}
          className="rounded-lg px-2 py-1 text-xs font-medium text-cyan-600 transition-colors hover:bg-cyan-100"
        >
          今天做
        </button>
        <DateTimePickerPopover
          value={task.scheduledAt}
          onChange={handleScheduleChange}
          label="选择日期"
          allowClear
          trigger={
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {task.scheduledAt ? formatDateTimeDisplay(task.scheduledAt) : "选日期…"}
            </button>
          }
        />
        <button
          type="button"
          onClick={unschedule}
          className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          取消安排
        </button>
      </div>
    </div>
  );
}
