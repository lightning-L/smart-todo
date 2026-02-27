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

  const alreadyLogged = !!todayLog;

  if (task.type === "habit_daily") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
        <div className="min-w-0 flex-1">
          <TaskRow task={task} />
        </div>
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={alreadyLogged}
          className="shrink-0 rounded px-2 py-1 text-xs text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50"
        >
          {alreadyLogged ? "已打卡" : "打卡"}
        </button>
      </div>
    );
  }

  if (task.type === "ongoing") {
    return (
      <div className="rounded-lg border border-white/5 bg-white/5 p-3">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <TaskRow task={task} />
          </div>
          <button
            type="button"
            onClick={handleComplete}
            className="shrink-0 rounded px-2 py-1 text-xs text-zinc-400 hover:bg-white/10"
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
              className="min-w-0 flex-1 rounded border border-white/10 bg-transparent px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={handleDoneToday}
              className="shrink-0 rounded bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300 hover:bg-cyan-500/30"
            >
              今日推进
            </button>
          </div>
        )}
        {alreadyLogged && (
          <p className="mt-1 text-xs text-zinc-500">
            今日已记录{todayLog?.note ? `：${todayLog.note}` : ""}
          </p>
        )}
      </div>
    );
  }

  return <TaskRow task={task} />;
}
