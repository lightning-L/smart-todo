import type { Task, DailyLog } from "./types";

function taskUpdatedAt(t: Task): string {
  return t.updatedAt ?? t.createdAt;
}

function logTimestamp(l: DailyLog): string {
  return l.updatedAt ?? l.createdAt;
}

/** Merge local and remote tasks by id; last-write-wins by updatedAt. */
export function mergeTasks(
  local: Task[],
  remote: Task[]
): { merged: Task[]; toPush: Task[] } {
  const remoteById = new Map(remote.map((t) => [t.id, t]));
  const merged: Task[] = [];
  const toPush: Task[] = [];

  for (const loc of local) {
    const rem = remoteById.get(loc.id);
    if (!rem) {
      merged.push(loc);
      toPush.push(loc);
      continue;
    }
    const localTime = taskUpdatedAt(loc);
    const remoteTime = taskUpdatedAt(rem);
    if (localTime >= remoteTime) {
      merged.push(loc);
      toPush.push(loc);
    } else {
      merged.push(rem);
    }
    remoteById.delete(loc.id);
  }

  for (const rem of remoteById.values()) {
    merged.push(rem);
  }

  return { merged, toPush };
}

/** Merge local and remote daily logs by id; last-write-wins. */
export function mergeDailyLogs(
  local: DailyLog[],
  remote: DailyLog[]
): { merged: DailyLog[]; toPush: DailyLog[] } {
  const remoteById = new Map(remote.map((l) => [l.id, l]));
  const merged: DailyLog[] = [];
  const toPush: DailyLog[] = [];

  for (const loc of local) {
    const rem = remoteById.get(loc.id);
    if (!rem) {
      merged.push(loc);
      toPush.push(loc);
      continue;
    }
    const localTime = logTimestamp(loc);
    const remoteTime = logTimestamp(rem);
    if (localTime >= remoteTime) {
      merged.push(loc);
      toPush.push(loc);
    } else {
      merged.push(rem);
    }
    remoteById.delete(loc.id);
  }

  for (const rem of remoteById.values()) {
    merged.push(rem);
  }

  return { merged, toPush };
}
