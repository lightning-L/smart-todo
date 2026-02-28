"use client";

import { useState, useCallback, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { AISplitGroup } from "@/lib/ai-split-mock";
import { getMockSplit } from "@/lib/ai-split-mock";
import { createTask } from "@/lib/task-crud";
import { db } from "@/lib/db";

interface AISplitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rootId: string;
  rootTitle: string;
  onInserted: () => void;
}

export function AISplitDialog({
  open,
  onOpenChange,
  rootId,
  rootTitle,
  onInserted,
}: AISplitDialogProps) {
  const [groups, setGroups] = useState<AISplitGroup[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const loading = false;

  useEffect(() => {
    if (open) {
      const res = getMockSplit(rootTitle);
      setGroups(JSON.parse(JSON.stringify(res.groups)));
      setDisclaimer(res.disclaimer);
    }
  }, [open, rootTitle]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      onOpenChange(isOpen);
    },
    [onOpenChange]
  );

  const updateItem = useCallback(
    (gi: number, ii: number, field: "title" | "note", value: string) => {
      setGroups((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        if (!next[gi]?.items?.[ii]) return prev;
        next[gi].items[ii][field] = value;
        return next;
      });
    },
    []
  );

  const insert = useCallback(async () => {
    for (const g of groups) {
      for (const item of g.items) {
        if (!item.title.trim()) continue;
        await createTask({
          title: item.title.trim(),
          parentId: rootId,
          type: "task",
        });
      }
    }
    onInserted();
    onOpenChange(false);
  }, [groups, rootId, onInserted, onOpenChange]);

  const replace = useCallback(async () => {
    const children = await db.tasks.where("parentId").equals(rootId).toArray();
    for (const c of children) {
      await db.tasks.delete(c.id);
    }
    for (const g of groups) {
      for (const item of g.items) {
        if (!item.title.trim()) continue;
        await createTask({
          title: item.title.trim(),
          parentId: rootId,
          type: "task",
        });
      }
    }
    onInserted();
    onOpenChange(false);
  }, [groups, rootId, onInserted, onOpenChange]);

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
              <div className="max-h-64 overflow-y-auto space-y-3 mb-3">
                {groups.map((g, gi) => (
                  <div key={gi} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{g.name}</div>
                    {g.items.map((item, ii) => (
                      <div key={ii} className="flex gap-2 py-1">
                        <input
                          value={item.title}
                          onChange={(e) => updateItem(gi, ii, "title", e.target.value)}
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="子任务标题"
                        />
                      </div>
                    ))}
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
