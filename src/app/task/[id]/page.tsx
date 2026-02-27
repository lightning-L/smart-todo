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
import { DateTimePickerPopover } from "@/components/DateTimePickerPopover";
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
          <p className="text-zinc-500">任务不存在</p>
          <Link href="/" className="text-cyan-400 hover:underline">返回</Link>
        </div>
      </AppLayout>
    );
  }

  const isCompleted = task.status === "completed";

  const backHref = task.parentId ? `/task/${task.parentId}` : "/";

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href={backHref} className="text-zinc-500 hover:text-cyan-400">
            ← 返回
          </Link>
          {task.parentId && parentTask && (
            <>
              <span className="text-zinc-600">·</span>
              <Link
                href={`/task/${task.parentId}`}
                className="text-zinc-400 hover:text-cyan-400"
              >
                {parentTask.title || "父任务"}
              </Link>
              <span className="text-zinc-600">›</span>
            </>
          )}
          <span className="text-foreground">
            {task.title || "（无标题）"}
          </span>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <input
              type="text"
              value={editTitle || task.title}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleTitleKeyDown}
              className="min-w-0 flex-1 rounded border border-white/10 bg-transparent px-2 py-1 text-lg text-foreground"
              placeholder="任务标题"
              title="回车保存"
            />
            <span className="text-xs text-zinc-500">{task.type}</span>
            {task.type === "task" && !task.parentId && !isCompleted && (
              <span className="flex gap-1">
                <button
                  type="button"
                  onClick={() => updateTask(task.id, { type: "project" })}
                  className="rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:bg-white/10"
                >
                  设为项目
                </button>
                <button
                  type="button"
                  onClick={() => updateTask(task.id, { type: "habit_daily" })}
                  className="rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:bg-white/10"
                >
                  设为每日习惯
                </button>
                <button
                  type="button"
                  onClick={() => updateTask(task.id, { type: "ongoing" })}
                  className="rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:bg-white/10"
                >
                  设为进行中
                </button>
              </span>
            )}
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <DateTimePickerPopover
              value={task.scheduledAt}
              onChange={(iso) => setScheduledAt(task.id, iso)}
              label="安排到"
              allowClear
              trigger={
                <button
                  type="button"
                  className="rounded border border-white/10 px-2 py-1 text-sm text-zinc-400 hover:bg-white/10"
                >
                  {task.scheduledAt
                    ? new Date(task.scheduledAt).toLocaleString("zh-CN")
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
                  className="rounded border border-white/10 px-2 py-1 text-sm text-zinc-400 hover:bg-white/10"
                >
                  {task.deadlineAt
                    ? new Date(task.deadlineAt).toLocaleString("zh-CN")
                    : "截止…"}
                </button>
              }
            />
            {!isCompleted ? (
              <button
                type="button"
                onClick={() => completeTask(task.id)}
                className="rounded bg-cyan-500/20 px-2 py-1 text-sm text-cyan-300 hover:bg-cyan-500/30"
              >
                完成
              </button>
            ) : (
              <button
                type="button"
                onClick={() => undoCompleteTask(task.id)}
                className="rounded px-2 py-1 text-sm text-zinc-400 hover:bg-white/10"
              >
                撤销完成
              </button>
            )}
          </div>

          {(task.type === "habit_daily" || task.type === "ongoing") && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <span className="mb-2 block text-xs font-medium uppercase text-zinc-500">
                每日记录
              </span>
              <DailyLogList taskId={task.id} />
            </div>
          )}

          {(task.type === "project" || task.parentId) && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase text-zinc-500">子任务</span>
                {task.type === "project" && !isCompleted && !showAddChildInput && (
                  <span className="flex gap-2">
                    <AISplitButton rootId={task.id} rootTitle={task.title} />
                    <button
                      type="button"
                      onClick={() => setShowAddChildInput(true)}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      + 添加子任务
                    </button>
                  </span>
                )}
              </div>
              {showAddChildInput && (
                <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-2">
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
                    className="min-w-0 flex-1 rounded border border-white/10 bg-transparent px-2 py-1.5 text-sm text-foreground"
                    placeholder="子任务标题，回车添加"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmAddChild}
                    className="rounded bg-cyan-500/20 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/30"
                  >
                    添加
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAddChild}
                    className="rounded px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/10"
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
