"use client";

import { useCallback, useState } from "react";
import type { Task } from "@/lib/types";
import { completeTask } from "@/lib/task-crud";
import {
  createDailyLog,
  getLogForTaskOnDate,
  todayDateString,
} from "@/lib/daily-log-crud";
import { useLiveQuery } from "dexie-react-hooks";
import { TaskRow } from "./TaskRow";

interface DailyTaskRowProps {
  task: Task;
}

export function DailyTaskRow({ task }: DailyTaskRowProps) {
  const today = todayDateString();
  const [note, setNote] = useState("");

  const todayLog = useLiveQuery(
    () => getLogForTaskOnDate(task.id, today),
    [task.id, today]
  );

  const handleCheckIn = useCallback(async () => {
    if (todayLog) return;
    await createDailyLog(task.id, today, true);
  }, [task.id, today, todayLog]);

  const handleDoneToday = useCallback(async () => {
    if (todayLog) return;
    await createDailyLog(task.id, today, true, note.trim() || undefined);
    setNote("");
  }, [task.id, today, todayLog, note]);

  const handleComplete = useCallback(async () => {
    await completeTask(task.id);
  }, [task.id]);

  const handleDoneTodayQuick = useCallback(async () => {
    if (todayLog) return;
    await createDailyLog(task.id, today, true);
  }, [task.id, today, todayLog]);

  const alreadyLogged = !!todayLog;

  if (task.type === "habit_daily") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm">
        <div className="min-w-0 flex-1">
          <TaskRow
            task={task}
            from="calendar"
            onToggle={handleCheckIn}
            checked={alreadyLogged}
          />
        </div>
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={alreadyLogged}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-cyan-600 transition-colors hover:bg-cyan-100 disabled:opacity-50"
        >
          {alreadyLogged ? "已打卡" : "打卡"}
        </button>
      </div>
    );
  }

  if (task.type === "ongoing") {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <TaskRow
              task={task}
              from="calendar"
              onToggle={handleDoneTodayQuick}
              checked={alreadyLogged}
            />
          </div>
          <button
            type="button"
            onClick={handleComplete}
            className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100"
          >
            全部完成
          </button>
        </div>
        {!alreadyLogged && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="今日推进备注（可选）"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
              type="button"
              onClick={handleDoneToday}
              className="shrink-0 rounded-lg bg-cyan-100 px-2.5 py-1.5 text-xs font-medium text-cyan-700 transition-colors hover:bg-cyan-200"
            >
              今日推进
            </button>
          </div>
        )}
        {alreadyLogged && (
          <p className="mt-1 text-xs text-slate-500">
            今日已记录{todayLog?.note ? `：${todayLog.note}` : ""}
          </p>
        )}
      </div>
    );
  }

  return <TaskRow task={task} from="calendar" />;
}
