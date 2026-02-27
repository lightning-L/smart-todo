"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { getProgressFromTasks } from "@/lib/task-tree";
import type { Task } from "@/lib/types";
import { TaskRow } from "./TaskRow";
import Link from "next/link";

interface ProjectTreeProps {
  rootId: string;
  depth?: number;
}

export function ProjectTree({ rootId, depth = 0 }: ProjectTreeProps) {
  const children = useLiveQuery(
    () => db.tasks.where("parentId").equals(rootId).sortBy("createdAt"),
    [rootId]
  );
  const allTasks = useLiveQuery(() => db.tasks.toArray(), []);

  const progressMap = useLiveQuery(() => {
    if (!allTasks) return new Map<string, { completed: number; total: number }>();
    const map = new Map<string, { completed: number; total: number }>();
    for (const t of allTasks) {
      if (t.type === "project" && !t.parentId) {
        map.set(t.id, getProgressFromTasks(t.id, allTasks));
      }
    }
    return map;
  }, [allTasks]);

  if (children === undefined) return null;
  if (children.length === 0) return null;

  return (
    <ul className="list-none pl-4" style={{ paddingLeft: depth * 16 + 16 }}>
      {children.map((task) => (
        <li key={task.id} className="mb-1">
          <div className="flex items-center gap-2">
            <TaskRow
              task={task}
              showTime={!!task.scheduledAt}
              progress={
                task.type === "project" && !task.parentId
                  ? progressMap?.get(task.id)
                  : undefined
              }
            />
            <Link
              href={`/task/${task.id}`}
              className="shrink-0 text-xs text-zinc-500 hover:text-cyan-400"
            >
              详情
            </Link>
          </div>
          {task.type === "project" && (
            <ProjectTree rootId={task.id} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}
