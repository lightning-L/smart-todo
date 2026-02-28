"use client";

import { useParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  updateTask,
  completeTask,
  undoCompleteTask,
  createTask,
  setScheduledAt,
  setDeadlineAt,
} from "@/lib/task-crud";
import { AppLayout } from "@/components/AppLayout";
import { DateTimePickerPopover, formatDateTimeDisplay } from "@/components/DateTimePickerPopover";
import { ProjectTree } from "@/components/ProjectTree";
import { DailyLogList } from "@/components/DailyLogList";
import { AISplitButton } from "@/components/AISplitButton";

export default function TaskDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const task = useLiveQuery(() => (id ? db.tasks.get(id) : undefined), [id]);
  const parentTask = useLiveQuery(
    async () => (task?.parentId ? await db.tasks.get(task.parentId!) : undefined),
    [task?.parentId]
  );
  const [editTitle, setEditTitle] = useState("");
  const [showAddChildInput, setShowAddChildInput] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState("");
  const newChildInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task?.title != null) setEditTitle(task.title);
  }, [task?.id, task?.title]);

  useEffect(() => {
    if (showAddChildInput) {
      setNewChildTitle("");
      newChildInputRef.current?.focus();
    }
  }, [showAddChildInput]);

  const handleSaveTitle = useCallback(async () => {
    if (task && editTitle.trim() !== task.title) {
      await updateTask(task.id, { title: editTitle.trim() || task.title });
    }
  }, [task, editTitle]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSaveTitle();
        (e.target as HTMLInputElement).blur();
      }
    },
    [handleSaveTitle]
  );

  const handleConfirmAddChild = useCallback(async () => {
    if (!task) return;
    const title = newChildTitle.trim() || "新子任务";
    await createTask({ title, parentId: task.id, type: "task" });
    setNewChildTitle("");
    setShowAddChildInput(false);
  }, [task, newChildTitle]);

  const handleCancelAddChild = useCallback(() => {
    setShowAddChildInput(false);
    setNewChildTitle("");
  }, []);

  if (task === undefined) {
    return (
      <AppLayout>
        <div className="p-6">加载中…</div>
      </AppLayout>
    );
  }
  if (!task) {
    return (
      <AppLayout>
        <div className="p-6">
          <p className="text-slate-500">任务不存在</p>
          <Link href="/" className="text-cyan-600 font-medium hover:underline">返回</Link>
        </div>
      </AppLayout>
    );
  }

  const isCompleted = task.status === "completed";

  const backHref = task.parentId ? `/task/${task.parentId}` : "/";

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Link href={backHref} className="font-medium text-cyan-600 hover:underline">
            ← 返回
          </Link>
          {task.parentId && parentTask && (
            <>
              <span className="text-slate-400">·</span>
              <Link
                href={`/task/${task.parentId}`}
                className="hover:text-cyan-600 hover:underline"
              >
                {parentTask.title || "父任务"}
              </Link>
              <span className="text-slate-400">›</span>
            </>
          )}
          <span className="font-semibold text-slate-800">
            {task.title || "（无标题）"}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <input
              type="text"
              value={editTitle || task.title}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleTitleKeyDown}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-lg font-medium text-slate-800 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              placeholder="任务标题"
              title="回车保存"
            />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{task.type}</span>
            {task.type === "task" && !task.parentId && !isCompleted && (
              <span className="flex gap-1">
                <button
                  type="button"
                  onClick={() => updateTask(task.id, { type: "project" })}
                  className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100"
                >
                  设为项目
                </button>
                <button
                  type="button"
                  onClick={() => updateTask(task.id, { type: "habit_daily" })}
                  className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100"
                >
                  设为每日习惯
                </button>
                <button
                  type="button"
                  onClick={() => updateTask(task.id, { type: "ongoing" })}
                  className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100"
                >
                  设为进行中
                </button>
              </span>
            )}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <DateTimePickerPopover
              value={task.scheduledAt}
              onChange={(iso) => setScheduledAt(task.id, iso)}
              label="安排到"
              allowClear
              trigger={
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
                >
                  {task.scheduledAt
                    ? formatDateTimeDisplay(task.scheduledAt)
                    : "安排…"}
                </button>
              }
            />
            <DateTimePickerPopover
              value={task.deadlineAt}
              onChange={(iso) => setDeadlineAt(task.id, iso)}
              label="截止"
              allowClear
              trigger={
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
                >
                  {task.deadlineAt
                    ? formatDateTimeDisplay(task.deadlineAt)
                    : "截止…"}
                </button>
              }
            />
            {!isCompleted ? (
              <button
                type="button"
                onClick={() => completeTask(task.id)}
                className="rounded-lg bg-cyan-100 px-3 py-1.5 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-200"
              >
                完成
              </button>
            ) : (
              <button
                type="button"
                onClick={() => undoCompleteTask(task.id)}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100"
              >
                撤销完成
              </button>
            )}
          </div>

          {(task.type === "habit_daily" || task.type === "ongoing") && (
            <div className="mt-5 border-t border-slate-200 pt-5">
              <span className="section-label mb-2 block border-l-2 border-cyan-500 pl-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                每日记录
              </span>
              <DailyLogList taskId={task.id} />
            </div>
          )}

          {(task.type === "project" || task.parentId) && (
            <div className="mt-5 border-t border-slate-200 pt-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="section-label border-l-2 border-cyan-500 pl-3 text-xs font-semibold uppercase tracking-wider text-slate-500">子任务</span>
                {task.type === "project" && !isCompleted && !showAddChildInput && (
                  <span className="flex gap-2">
                    <AISplitButton rootId={task.id} rootTitle={task.title} />
                    <button
                      type="button"
                      onClick={() => setShowAddChildInput(true)}
                      className="text-xs font-medium text-cyan-600 hover:underline"
                    >
                      + 添加子任务
                    </button>
                  </span>
                )}
              </div>
              {showAddChildInput && (
                <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50/80 p-3 shadow-sm">
                  <input
                    ref={newChildInputRef}
                    type="text"
                    value={newChildTitle}
                    onChange={(e) => setNewChildTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleConfirmAddChild();
                      }
                      if (e.key === "Escape") handleCancelAddChild();
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="子任务标题，回车添加"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmAddChild}
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
              <ProjectTree rootId={task.id} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
