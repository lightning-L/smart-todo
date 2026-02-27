"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { InboxTaskRow } from "./InboxTaskRow";

export function InboxList() {
  const tasks = useLiveQuery(
    () =>
      db.tasks
        .where("status")
        .equals("active")
        .filter(
          (t) =>
            (t.scheduledAt == null || t.scheduledAt === "") &&
            (t.parentId == null || t.parentId === "")
        )
        .reverse()
        .sortBy("createdAt"),
    []
  );

  if (tasks === undefined) {
    return <div className="text-zinc-500">加载中…</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500">
        收件箱为空。未安排的任务会出现在这里。
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {tasks.map((task) => (
        <li key={task.id}>
          <InboxTaskRow task={task} />
        </li>
      ))}
    </ul>
  );
}
