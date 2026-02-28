"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { db } from "@/lib/db";
import { useUiStore } from "@/store/ui-store";
import { isScheduledOn, isCompletedOn } from "@/lib/queries";
import { getProgressFromTasks } from "@/lib/task-tree";
import { AgendaSection } from "./AgendaSection";
import { DailyTaskRow } from "./DailyTaskRow";

export function AgendaView() {
  const { selectedDate } = useUiStore();
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

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold tracking-tight text-slate-800">
        {format(selectedDate, "M月d日 EEEE", { locale: zhCN })}
      </h1>
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
