import type { Task } from "./types";
import {
  startOfDay,
  endOfDay,
  isWithinInterval,
  parseISO,
  addDays,
  isBefore,
} from "date-fns";

export function isScheduledOn(task: Task, date: Date): boolean {
  if (!task.scheduledAt) return false;
  const d = parseISO(task.scheduledAt);
  return isWithinInterval(d, { start: startOfDay(date), end: endOfDay(date) });
}

export function isCompletedOn(task: Task, date: Date): boolean {
  if (!task.completedAt || task.status !== "completed") return false;
  const d = parseISO(task.completedAt);
  return isWithinInterval(d, { start: startOfDay(date), end: endOfDay(date) });
}

export function isMissed(task: Task, todayStart: Date): boolean {
  if (task.status !== "active" || !task.scheduledAt) return false;
  return isBefore(parseISO(task.scheduledAt), todayStart);
}

export function isDueSoon(task: Task, now: Date, days = 14): boolean {
  if (!task.deadlineAt || task.status !== "active") return false;
  const deadline = parseISO(task.deadlineAt);
  const end = addDays(now, days);
  return isWithinInterval(deadline, { start: now, end }) || isBefore(deadline, now);
}

export function isOverdue(task: Task, now: Date): boolean {
  if (!task.deadlineAt || task.status !== "active") return false;
  return isBefore(parseISO(task.deadlineAt), now);
}
