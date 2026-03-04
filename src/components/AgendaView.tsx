"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { format, addDays, startOfDay, isToday } from "date-fns";
import { zhCN } from "date-fns/locale";
import { db } from "@/lib/db";
import { useUiStore } from "@/store/ui-store";
import { isScheduledOn, isCompletedOn } from "@/lib/queries";
import { getProgressFromTasks } from "@/lib/task-tree";
import { AgendaSection } from "./AgendaSection";
import { DailyTaskRow } from "./DailyTaskRow";

export function AgendaView() {
  const { selectedDate, setSelectedDate } = useUiStore();
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);

  const { scheduled, daily, done } = useMemo(() => {
    if (!tasks) return { scheduled: [], daily: [], done: [] };
    const today = new Date();
    const scheduled: typeof tasks = [];
    const daily: typeof tasks = [];
    const done: typeof tasks = [];
    for (const t of tasks) {
      if (t.status === "active") {
        if (isScheduledOn(t, selectedDate)) scheduled.push(t);
        else if (
          (t.type === "habit_daily" || t.type === "ongoing") &&
          selectedDate.getDate() === today.getDate() &&
          selectedDate.getMonth() === today.getMonth() &&
          selectedDate.getFullYear() === today.getFullYear()
        ) {
          daily.push(t);
        }
      } else if (t.status === "completed" && isCompletedOn(t, selectedDate)) {
        done.push(t);
      }
    }
    scheduled.sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()
    );
    return { scheduled, daily, done };
  }, [tasks, selectedDate]);

  const progressMap = useMemo(() => {
    const map = new Map<string, { completed: number; total: number }>();
    if (!tasks) return map;
    for (const t of tasks) {
      if (t.type === "project" && !t.parentId) {
        map.set(t.id, getProgressFromTasks(t.id, tasks));
      }
    }
    return map;
  }, [tasks]);

  if (tasks === undefined) {
    return <div className="text-slate-500">加载中…</div>;
  }

  const isSelectedToday = isToday(selectedDate);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setSelectedDate(startOfDay(new Date()))}
          disabled={isSelectedToday}
          className={`shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
            isSelectedToday
              ? "cursor-default text-slate-400"
              : "text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700"
          }`}
          aria-label="今天"
        >
          今天
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-700 transition-colors hover:bg-slate-300 hover:text-slate-900"
            aria-label="前一天"
          >
            ‹
          </button>
          <h1 className="min-w-0 truncate text-center text-xl font-semibold tracking-tight text-slate-800">
            {format(selectedDate, "M月d日 EEEE", { locale: zhCN })}
          </h1>
          <button
            type="button"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-700 transition-colors hover:bg-slate-300 hover:text-slate-900"
            aria-label="后一天"
          >
            ›
          </button>
        </div>
        <div className="w-[4.5rem] shrink-0" aria-hidden />
      </div>
      <AgendaSection title="已安排" tasks={scheduled} showTime progressMap={progressMap} from="calendar" />
      {daily.length > 0 && (
        <section className="mb-6">
          <h2 className="section-label mb-2.5 border-l-2 border-cyan-500 pl-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            每日
          </h2>
          <ul className="flex flex-col gap-1">
            {daily.map((task) => (
              <li key={task.id}>
                <DailyTaskRow task={task} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <AgendaSection title="已完成" tasks={done} showTime progressMap={progressMap} from="calendar" />
      {scheduled.length === 0 && daily.length === 0 && done.length === 0 && (
        <p className="text-sm text-slate-500">当天暂无任务</p>
      )}
    </div>
  );
}
