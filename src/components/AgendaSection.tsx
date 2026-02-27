"use client";

import type { Task } from "@/lib/types";
import { TaskRow } from "./TaskRow";

interface AgendaSectionProps {
  title: string;
  tasks: Task[];
  showTime?: boolean;
  progressMap?: Map<string, { completed: number; total: number }>;
}

export function AgendaSection({ title, tasks, showTime = false, progressMap }: AgendaSectionProps) {
  if (tasks.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      <ul className="flex flex-col gap-1">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskRow
              task={task}
              showTime={showTime}
              progress={task.type === "project" && !task.parentId ? progressMap?.get(task.id) : undefined}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
