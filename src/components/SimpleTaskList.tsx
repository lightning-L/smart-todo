"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { TaskRow } from "./TaskRow";

export function SimpleTaskList() {
  const tasks = useLiveQuery(() => db.tasks.orderBy("createdAt").reverse().toArray(), []);

  if (tasks === undefined) {
    return <div className="text-zinc-500">加载中…</div>;
  }

  if (tasks.length === 0) {
    return <div className="py-8 text-center text-zinc-500">暂无任务，在上方输入框添加</div>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskRow task={task} showTime={!!task.scheduledAt} />
        </li>
      ))}
    </ul>
  );
}
