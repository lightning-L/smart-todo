"use client";

import { useCallback } from "react";
import Link from "next/link";
import { startOfDay, format, parseISO } from "date-fns";
import type { Task } from "@/lib/types";
import { setScheduledAt, completeTask } from "@/lib/task-crud";
import { DateTimePickerPopover } from "./DateTimePickerPopover";

interface MissedTaskRowProps {
  task: Task;
}

function formatTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return "";
  }
}

export function MissedTaskRow({ task }: MissedTaskRowProps) {
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
    <div className="flex min-h-[44px] items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
      <button
        type="button"
        onClick={handleComplete}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/20 bg-transparent"
        aria-pressed={isCompleted}
      >
        {isCompleted && <span className="text-cyan-400">✓</span>}
      </button>
      <span className="w-14 shrink-0 text-xs tabular-nums text-zinc-500">
        {task.scheduledAt ? formatTime(task.scheduledAt) : "—"}
      </span>
      <Link
        href={`/task/${task.id}`}
        className={`min-w-0 flex-1 truncate hover:underline ${isCompleted ? "text-zinc-500 line-through" : "text-foreground"}`}
      >
        {task.title || "（无标题）"}
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={doToday}
          className="rounded px-2 py-1 text-xs text-cyan-400 hover:bg-cyan-500/20"
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
              className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
            >
              选日期…
            </button>
          }
        />
        <button
          type="button"
          onClick={unschedule}
          className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
        >
          取消安排
        </button>
      </div>
    </div>
  );
}
