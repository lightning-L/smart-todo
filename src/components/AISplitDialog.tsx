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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-zinc-900 p-4 shadow-xl">
          <Dialog.Title className="mb-2 text-lg font-medium text-foreground">
            AI 拆解：{rootTitle}
          </Dialog.Title>
          {loading ? (
            <p className="text-zinc-500">生成中…</p>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto space-y-3 mb-3">
                {groups.map((g, gi) => (
                  <div key={gi} className="rounded border border-white/10 bg-white/5 p-2">
                    <div className="mb-1 text-xs font-medium text-zinc-400">{g.name}</div>
                    {g.items.map((item, ii) => (
                      <div key={ii} className="flex gap-2 py-1">
                        <input
                          value={item.title}
                          onChange={(e) => updateItem(gi, ii, "title", e.target.value)}
                          className="min-w-0 flex-1 rounded border border-white/10 bg-transparent px-2 py-1 text-sm"
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
                    className="rounded px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/10"
                  >
                    取消
                  </button>
                </Dialog.Close>
                <button
                  type="button"
                  onClick={() => replace()}
                  className="rounded bg-red-500/20 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/30"
                >
                  替换现有子任务
                </button>
                <button
                  type="button"
                  onClick={() => insert()}
                  className="rounded bg-cyan-500/20 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/30"
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
