"use client";

import type { Task } from "@/lib/types";
import { TaskRow } from "./TaskRow";

interface AgendaSectionProps {
  title: string;
  tasks: Task[];
  showTime?: boolean;
  progressMap?: Map<string, { completed: number; total: number }>;
  from?: "calendar";
}

export function AgendaSection({ title, tasks, showTime = false, progressMap, from }: AgendaSectionProps) {
  if (tasks.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="section-label mb-2.5 border-l-2 border-cyan-500 pl-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h2>
      <ul className="flex flex-col gap-1">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskRow
              task={task}
              showTime={showTime}
              progress={task.type === "project" && !task.parentId ? progressMap?.get(task.id) : undefined}
              from={from}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
