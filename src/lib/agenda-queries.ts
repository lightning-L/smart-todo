import {
  startOfDay,
  endOfDay,
  isWithinInterval,
  parseISO,
  isSameDay,
} from "date-fns";
import { db } from "./db";
import type { Task } from "./types";

export async function getScheduledForDate(date: Date): Promise<Task[]> {
  const start = startOfDay(date);
  const end = endOfDay(date);
  const all = await db.tasks
    .where("status")
    .equals("active")
    .filter((t) => {
      if (!t.scheduledAt) return false;
      const d = parseISO(t.scheduledAt);
      return isWithinInterval(d, { start, end });
    })
    .toArray();
  return all.sort(
    (a, b) =>
      new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()
  );
}

export async function getDailyForDate(date: Date): Promise<Task[]> {
  const today = startOfDay(new Date());
  if (!isSameDay(date, today)) return [];
  return db.tasks
    .where("status")
    .equals("active")
    .filter((t) => t.type === "habit_daily" || t.type === "ongoing")
    .toArray();
}

export async function getDoneForDate(date: Date): Promise<Task[]> {
  const start = startOfDay(date);
  const end = endOfDay(date);
  return db.tasks
    .where("status")
    .equals("completed")
    .filter((t) => {
      if (!t.completedAt) return false;
      const d = parseISO(t.completedAt);
      return isWithinInterval(d, { start, end });
    })
    .toArray();
}
