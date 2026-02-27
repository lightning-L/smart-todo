import { db } from "./db";
import type { Task } from "./types";

export async function getChildren(parentId: string): Promise<Task[]> {
  return db.tasks.where("parentId").equals(parentId).sortBy("createdAt");
}

export async function getRoot(task: Task): Promise<Task> {
  if (!task.parentId) return task;
  const parent = await db.tasks.get(task.parentId);
  if (!parent) return task;
  return getRoot(parent);
}

export async function getAllDescendants(rootId: string): Promise<Task[]> {
  const children = await getChildren(rootId);
  const result: Task[] = [...children];
  for (const c of children) {
    const desc = await getAllDescendants(c.id);
    result.push(...desc);
  }
  return result;
}

export async function getProgress(rootId: string): Promise<{ completed: number; total: number }> {
  const descendants = await getAllDescendants(rootId);
  const total = descendants.length;
  const completed = descendants.filter((t) => t.status === "completed").length;
  return { completed, total };
}

/** Compute progress from a flat list of tasks (e.g. from useLiveQuery). */
export function getProgressFromTasks(
  rootId: string,
  allTasks: Task[]
): { completed: number; total: number } {
  const byParent = new Map<string, Task[]>();
  for (const t of allTasks) {
    const pid = t.parentId ?? "__root__";
    if (!byParent.has(pid)) byParent.set(pid, []);
    byParent.get(pid)!.push(t);
  }
  function collect(id: string): Task[] {
    const children = byParent.get(id) ?? [];
    const out: Task[] = [...children];
    for (const c of children) {
      out.push(...collect(c.id));
    }
    return out;
  }
  const descendants = collect(rootId);
  const total = descendants.length;
  const completed = descendants.filter((t) => t.status === "completed").length;
  return { completed, total };
}
