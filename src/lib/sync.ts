import { db } from "./db";
import { supabase } from "./supabase";
import { getSession } from "./auth";
import { mergeTasks, mergeDailyLogs } from "./sync-merge";
import type { Task, DailyLog } from "./types";

// Supabase uses snake_case; map to/from app camelCase
function taskToRow(t: Task, userId: string) {
  return {
    id: t.id,
    user_id: userId,
    title: t.title,
    type: t.type,
    status: t.status,
    parent_id: t.parentId ?? null,
    scheduled_at: t.scheduledAt ?? null,
    deadline_at: t.deadlineAt ?? null,
    completed_at: t.completedAt ?? null,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

function rowToTask(r: Record<string, unknown>): Task {
  return {
    id: r.id as string,
    title: r.title as string,
    type: r.type as Task["type"],
    status: r.status as Task["status"],
    parentId: (r.parent_id as string) ?? undefined,
    scheduledAt: (r.scheduled_at as string) ?? undefined,
    deadlineAt: (r.deadline_at as string) ?? undefined,
    completedAt: (r.completed_at as string) ?? undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function logToRow(l: DailyLog, userId: string) {
  return {
    id: l.id,
    user_id: userId,
    task_id: l.taskId,
    date: l.date,
    did: l.did,
    note: l.note ?? null,
    created_at: l.createdAt,
    updated_at: l.updatedAt ?? l.createdAt,
  };
}

function rowToLog(r: Record<string, unknown>): DailyLog {
  return {
    id: r.id as string,
    taskId: r.task_id as string,
    date: r.date as string,
    did: r.did as boolean,
    note: (r.note as string) ?? undefined,
    createdAt: r.created_at as string,
    updatedAt: (r.updated_at as string) ?? undefined,
  };
}

export async function pullAndMerge(): Promise<{ error: Error | null }> {
  const session = await getSession();
  const client = supabase;
  if (!session?.user?.id || !client) {
    return { error: null };
  }
  const userId = session.user.id;

  try {
    const [tasksRes, logsRes] = await Promise.all([
      client.from("tasks").select("*").eq("user_id", userId),
      client.from("daily_logs").select("*").eq("user_id", userId),
    ]);

    if (tasksRes.error) return { error: tasksRes.error as unknown as Error };
    if (logsRes.error) return { error: logsRes.error as unknown as Error };

    const remoteTasks = ((tasksRes.data ?? []) as Record<string, unknown>[]).map(rowToTask);
    const remoteLogs = ((logsRes.data ?? []) as Record<string, unknown>[]).map(rowToLog);

    const localTasks = await db.tasks.toArray();
    const localLogs = await db.dailyLogs.toArray();

    const { merged: mergedTasks, toPush: tasksToPush } = mergeTasks(localTasks, remoteTasks);
    const { merged: mergedLogs, toPush: logsToPush } = mergeDailyLogs(localLogs, remoteLogs);

    // Write merged back to Dexie (clear and put to avoid ordering/duplicates)
    await db.transaction("rw", db.tasks, db.dailyLogs, async () => {
      await db.tasks.clear();
      await db.tasks.bulkPut(mergedTasks);
      await db.dailyLogs.clear();
      await db.dailyLogs.bulkPut(mergedLogs);
    });

    // Push local-only or newer local to server
    for (const t of tasksToPush) {
      await client.from("tasks").upsert(taskToRow(t, userId), {
        onConflict: "id",
      });
    }
    for (const l of logsToPush) {
      await client.from("daily_logs").upsert(logToRow(l, userId), {
        onConflict: "id",
      });
    }
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
  return { error: null };
}

export async function pushTask(task: Task): Promise<void> {
  const session = await getSession();
  const client = supabase;
  if (!session?.user?.id || !client) return;
  await client.from("tasks").upsert(taskToRow(task, session.user.id), { onConflict: "id" });
}

export async function pushDailyLog(log: DailyLog): Promise<void> {
  const session = await getSession();
  const client = supabase;
  if (!session?.user?.id || !client) return;
  await client.from("daily_logs").upsert(logToRow(log, session.user.id), { onConflict: "id" });
}

export async function deleteTaskOnServer(id: string): Promise<void> {
  const session = await getSession();
  const client = supabase;
  if (!session?.user?.id || !client) return;
  await client.from("tasks").delete().eq("id", id).eq("user_id", session.user.id);
}

export async function deleteDailyLogOnServer(id: string): Promise<void> {
  const session = await getSession();
  const client = supabase;
  if (!session?.user?.id || !client) return;
  await client.from("daily_logs").delete().eq("id", id).eq("user_id", session.user.id);
}

/** Push task by id from Dexie to server (no-op if not logged in or task missing). */
export async function pushTaskById(id: string): Promise<void> {
  const task = await db.tasks.get(id);
  if (task) await pushTask(task);
}
