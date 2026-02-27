import { nanoid } from "nanoid";
import { db } from "./db";
import type { Task, TaskType } from "./types";

const now = () => new Date().toISOString();

export async function createTask(
  input: Partial<Pick<Task, "title" | "type" | "parentId" | "scheduledAt" | "deadlineAt">>
): Promise<Task> {
  const task: Task = {
    id: nanoid(),
    title: input.title ?? "",
    type: input.type ?? "task",
    status: "active",
    parentId: input.parentId,
    scheduledAt: input.scheduledAt,
    deadlineAt: input.deadlineAt,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.tasks.add(task);
  return task;
}

export async function getTask(id: string): Promise<Task | undefined> {
  return db.tasks.get(id);
}

export async function getAllTasks(): Promise<Task[]> {
  return db.tasks.orderBy("createdAt").reverse().toArray();
}

export async function getActiveTasks(): Promise<Task[]> {
  return db.tasks.where("status").equals("active").reverse().sortBy("createdAt");
}

export async function updateTask(
  id: string,
  updates: Partial<Pick<Task, "title" | "type" | "scheduledAt" | "deadlineAt" | "status" | "completedAt">>
): Promise<void> {
  await db.tasks.update(id, { ...updates, updatedAt: now() });
}

async function tryCompleteRoot(rootId: string): Promise<void> {
  const { getRoot, getAllDescendants } = await import("./task-tree");
  const root = await db.tasks.get(rootId);
  if (!root || root.status === "completed") return;
  const descendants = await getAllDescendants(rootId);
  const allDone = descendants.every((t) => t.status === "completed");
  if (!allDone) return;
  const completedAt = now();
  await db.tasks.update(rootId, {
    status: "completed",
    completedAt,
    scheduledAt: undefined,
    updatedAt: completedAt,
  });
  if (root.parentId) await tryCompleteRoot(root.parentId);
}

export async function completeTask(id: string): Promise<void> {
  const task = await db.tasks.get(id);
  if (!task) return;
  const completedAt = now();
  await db.tasks.update(id, {
    status: "completed",
    completedAt,
    scheduledAt: undefined,
    updatedAt: completedAt,
  });
  const { getRoot } = await import("./task-tree");
  const root = await getRoot(task);
  if (root.id !== task.id) await tryCompleteRoot(root.id);
}

export async function undoCompleteTask(id: string): Promise<void> {
  await db.tasks.update(id, {
    status: "active",
    completedAt: undefined,
    updatedAt: now(),
  });
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id);
}

export async function setScheduledAt(id: string, scheduledAt: string | null): Promise<void> {
  await db.tasks.update(id, { scheduledAt: scheduledAt ?? undefined, updatedAt: now() });
}

export async function setDeadlineAt(id: string, deadlineAt: string | null): Promise<void> {
  await db.tasks.update(id, { deadlineAt: deadlineAt ?? undefined, updatedAt: now() });
}
