"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { createTask } from "@/lib/task-crud";
import { getProgressFromTasks } from "@/lib/task-tree";
import type { Task } from "@/lib/types";
import { TaskRow } from "./TaskRow";

interface ProjectTreeProps {
  rootId: string;
  depth?: number;
  /** Preserve back-navigation source (e.g. from=inbox) when opening child tasks */
  from?: string | null;
}

export function ProjectTree({ rootId, depth = 0, from }: ProjectTreeProps) {
  const [addingForTaskId, setAddingForTaskId] = useState<string | null>(null);
  const [newChildTitle, setNewChildTitle] = useState("");
  const newChildInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (addingForTaskId !== null) {
      setNewChildTitle("");
      newChildInputRef.current?.focus();
    }
  }, [addingForTaskId]);

  const handleConfirmAddChild = useCallback(
    async (parentId: string) => {
      const title = newChildTitle.trim() || "新子任务";
      await createTask({ title, parentId, type: "task" });
      setNewChildTitle("");
      setAddingForTaskId(null);
    },
    [newChildTitle]
  );

  const handleCancelAddChild = useCallback(() => {
    setAddingForTaskId(null);
    setNewChildTitle("");
  }, []);

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
              from={from === "all" || from === "calendar" || from === "inbox" ? from : undefined}
            />
            {task.status !== "completed" && (
              <button
                type="button"
                onClick={() => setAddingForTaskId(task.id)}
                className="shrink-0 text-xs font-medium text-slate-500 transition-colors hover:text-cyan-600"
              >
                + 子任务
              </button>
            )}
          </div>
          {addingForTaskId === task.id && (
            <div
              className="mb-2 mt-1 flex flex-wrap items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50/80 p-3 shadow-sm"
              style={{ marginLeft: 0 }}
            >
              <input
                ref={newChildInputRef}
                type="text"
                value={newChildTitle}
                onChange={(e) => setNewChildTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirmAddChild(task.id);
                  }
                  if (e.key === "Escape") handleCancelAddChild();
                }}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="子任务标题，回车添加"
              />
              <button
                type="button"
                onClick={() => handleConfirmAddChild(task.id)}
                className="rounded-lg bg-cyan-100 px-3 py-1.5 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-200"
              >
                添加
              </button>
              <button
                type="button"
                onClick={handleCancelAddChild}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100"
              >
                取消
              </button>
            </div>
          )}
          <ProjectTree rootId={task.id} depth={depth + 1} from={from} />
        </li>
      ))}
    </ul>
  );
}
