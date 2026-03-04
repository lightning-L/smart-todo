"use client";

import { useState, useCallback, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { AISplitItemWithLevel } from "@/lib/ai-split-mock";
import { createTask, deleteTask } from "@/lib/task-crud";
import { getAllDescendants } from "@/lib/task-tree";

interface AISplitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rootId: string;
  rootTitle: string;
  rootDescription?: string;
  deadlineAt?: string;
  onInserted: () => void;
}

export function AISplitDialog({
  open,
  onOpenChange,
  rootId,
  rootTitle,
  rootDescription,
  deadlineAt,
  onInserted,
}: AISplitDialogProps) {
  const [items, setItems] = useState<AISplitItemWithLevel[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setItems([]);
    setDisclaimer("");

    (async () => {
      try {
        const res = await fetch("/api/ai-split", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rootTitle,
            rootDescription: rootDescription || undefined,
            deadlineAt: deadlineAt || undefined,
          }),
        });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items)) {
            setItems(JSON.parse(JSON.stringify(data.items)));
            setDisclaimer(typeof data.disclaimer === "string" ? data.disclaimer : "");
          } else {
            setDisclaimer("生成失败，请重试。");
          }
        } else {
          setDisclaimer("生成失败，请重试。");
        }
      } catch {
        if (!cancelled) {
          setDisclaimer("生成失败，请重试。");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, rootTitle, rootDescription, deadlineAt]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      onOpenChange(isOpen);
    },
    [onOpenChange]
  );

  const updateItem = useCallback((index: number, field: "title" | "note", value: string) => {
    setItems((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next[index]) return prev;
      next[index][field] = value;
      return next;
    });
  }, []);

  const applyItems = useCallback(
    async (replaceExisting: boolean) => {
      if (replaceExisting) {
        const descendants = await getAllDescendants(rootId);
        for (let i = descendants.length - 1; i >= 0; i--) {
          await deleteTask(descendants[i].id);
        }
      }
      const parentStack: string[] = [];
      for (const item of items) {
        if (!item.title.trim()) continue;
        const level = Math.max(0, Math.min(item.level, parentStack.length));
        const parentId = level === 0 ? rootId : (parentStack[level - 1] ?? rootId);
        const task = await createTask({
          title: item.title.trim(),
          parentId,
          type: "task",
        });
        parentStack.length = level;
        parentStack.push(task.id);
      }
      onInserted();
      onOpenChange(false);
    },
    [items, rootId, onInserted, onOpenChange]
  );

  const insert = useCallback(() => applyItems(false), [applyItems]);
  const replace = useCallback(() => applyItems(true), [applyItems]);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xl">
          <Dialog.Title className="mb-3 text-lg font-semibold tracking-tight text-slate-800">
            AI 拆解：{rootTitle}
          </Dialog.Title>
          {loading ? (
            <p className="text-slate-500">生成中…</p>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto space-y-1 mb-3">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-2 py-1"
                    style={{ paddingLeft: item.level * 20 }}
                  >
                    <input
                      value={item.title}
                      onChange={(e) => updateItem(i, "title", e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="子任务标题"
                    />
                  </div>
                ))}
              </div>
              {disclaimer && (
                <p className="mb-3 text-xs text-zinc-500">{disclaimer}</p>
              )}
              <div className="flex justify-end gap-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100"
                  >
                    取消
                  </button>
                </Dialog.Close>
                <button
                  type="button"
                  onClick={() => replace()}
                  className="rounded bg-red-100 px-3 py-1.5 text-sm text-red-700 hover:bg-red-200"
                >
                  替换现有子任务
                </button>
                <button
                  type="button"
                  onClick={() => insert()}
                  className="rounded bg-cyan-100 px-3 py-1.5 text-sm text-cyan-700 hover:bg-cyan-200"
                >
                  插入
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
