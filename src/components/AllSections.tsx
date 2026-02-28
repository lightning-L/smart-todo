"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { db } from "@/lib/db";
import { partitionAllSections } from "@/lib/all-sections-queries";
import { getProgressFromTasks } from "@/lib/task-tree";
import { TaskRow } from "./TaskRow";
import { InboxTaskRow } from "./InboxTaskRow";
import { MissedTaskRow } from "./MissedTaskRow";
import Link from "next/link";

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <h2 className="section-label mb-2.5 border-l-2 border-cyan-500 pl-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
      {title}
      {count > 0 && <span className="ml-1 font-normal text-slate-600">({count})</span>}
    </h2>
  );
}

function CollapsibleSection({
  title,
  count,
  defaultOpen,
  children,
}: {
  title: string;
  count: number;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (count === 0) return null;
  return (
    <section className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-2 flex w-full items-center gap-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-700"
      >
        <span>{open ? "▼" : "▶"}</span>
        {title} ({count})
      </button>
      {open && children}
    </section>
  );
}

export function AllSections() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const sections = useMemo(() => {
    if (!tasks) return null;
    return partitionAllSections(tasks, new Date());
  }, [tasks]);

  if (tasks === undefined || !sections) {
    return <div className="text-slate-500">加载中…</div>;
  }

  const progressMap = useMemo(() => {
    const map = new Map<string, { completed: number; total: number }>();
    for (const t of tasks) {
      if (t.type === "project" && !t.parentId) {
        map.set(t.id, getProgressFromTasks(t.id, tasks));
      }
    }
    return map;
  }, [tasks]);

  const progress = (task: { id: string; type: string; parentId?: string }) =>
    task.type === "project" && !task.parentId ? progressMap.get(task.id) : undefined;

  return (
    <div className="space-y-6">
      {/* 1. Missed */}
      <section className="mb-6">
        <SectionHeader title="未完成（已过计划日）" count={sections.missed.length} />
        {sections.missed.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {sections.missed.map((task) => (
              <li key={task.id}>
                <MissedTaskRow task={task} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* 2. Today */}
      <section className="mb-6">
        <SectionHeader title="今天" count={sections.today.length} />
        {sections.today.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {sections.today.map((task) => (
              <li key={task.id}>
                <TaskRow task={task} showTime progress={progress(task)} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* 3. Due soon */}
      <section className="mb-6">
        <SectionHeader title="即将到期" count={sections.dueSoon.length} />
        {sections.dueSoon.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {sections.dueSoon.map((task) => (
              <li key={task.id}>
                <TaskRow task={task} showTime progress={progress(task)} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* 4. Upcoming */}
      <section className="mb-6">
        <SectionHeader title="接下来 7 天" count={sections.upcoming.length} />
        {sections.upcoming.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {sections.upcoming.map((task) => (
              <li key={task.id}>
                <TaskRow task={task} showTime progress={progress(task)} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* 5. Inbox */}
      <section className="mb-6">
        <SectionHeader title="收件箱 / 未安排" count={sections.inbox.length} />
        {sections.inbox.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {sections.inbox.map((task) => (
              <li key={task.id}>
                <InboxTaskRow task={task} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">
            无未安排任务。<Link href="/inbox" className="text-cyan-600 font-medium hover:underline">收件箱</Link>
          </p>
        )}
      </section>

      {/* 6. Done - Today expanded, older collapsed */}
      <CollapsibleSection
        title="今日已完成"
        count={sections.doneToday.length}
        defaultOpen={true}
      >
        <ul className="flex flex-col gap-1">
          {sections.doneToday.map((task) => (
            <li key={task.id}>
              <TaskRow task={task} showTime progress={progress(task)} />
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection
        title="更早已完成"
        count={sections.doneOlder.length}
        defaultOpen={false}
      >
        <ul className="flex flex-col gap-1">
          {sections.doneOlder.map((task) => (
            <li key={task.id}>
              <TaskRow task={task} showTime progress={progress(task)} />
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    </div>
  );
}
