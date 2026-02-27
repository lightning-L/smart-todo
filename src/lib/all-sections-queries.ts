import {
  startOfDay,
  addDays,
  isWithinInterval,
  parseISO,
  isBefore,
  isAfter,
} from "date-fns";
import type { Task } from "./types";

const DUE_SOON_DAYS = 14;
const UPCOMING_DAYS = 7;

export function partitionAllSections(tasks: Task[], now: Date) {
  const todayStart = startOfDay(now);
  const todayEnd = addDays(todayStart, 1);
  const upcomingEnd = addDays(todayStart, UPCOMING_DAYS + 1);

  const missed: Task[] = [];
  const today: Task[] = [];
  const dueSoon: Task[] = [];
  const upcoming: Task[] = [];
  const inbox: Task[] = [];
  const doneToday: Task[] = [];
  const doneOlder: Task[] = [];

  for (const t of tasks) {
    if (t.status === "archived") continue;

    if (t.status === "completed") {
      if (!t.completedAt) {
        doneOlder.push(t);
        continue;
      }
      const completedDate = parseISO(t.completedAt);
      if (isWithinInterval(completedDate, { start: todayStart, end: todayEnd })) {
        doneToday.push(t);
      } else {
        doneOlder.push(t);
      }
      continue;
    }

    if (t.status !== "active") continue;

    if (t.scheduledAt) {
      const scheduledDate = parseISO(t.scheduledAt);
      if (isBefore(scheduledDate, todayStart)) {
        missed.push(t);
        continue;
      }
      if (isWithinInterval(scheduledDate, { start: todayStart, end: todayEnd })) {
        today.push(t);
        continue;
      }
      if (isBefore(scheduledDate, upcomingEnd) && isAfter(scheduledDate, todayEnd)) {
        upcoming.push(t);
        continue;
      }
      continue;
    }

    if (t.deadlineAt) {
      const deadline = parseISO(t.deadlineAt);
      const dueSoonEnd = addDays(now, DUE_SOON_DAYS);
      if (isBefore(deadline, now) || isWithinInterval(deadline, { start: now, end: dueSoonEnd })) {
        dueSoon.push(t);
      }
    }
    if (!t.parentId) inbox.push(t);
  }

  // Due soon: also include active tasks that are in today/upcoming but have deadline in range (no dedup)
  for (const t of [...today, ...upcoming, ...missed]) {
    if (t.deadlineAt) {
      const deadline = parseISO(t.deadlineAt);
      const dueSoonEnd = addDays(now, DUE_SOON_DAYS);
      if (
        (isBefore(deadline, now) || isWithinInterval(deadline, { start: now, end: dueSoonEnd })) &&
        !dueSoon.includes(t)
      ) {
        dueSoon.push(t);
      }
    }
  }

  today.sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());
  upcoming.sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());
  dueSoon.sort((a, b) => new Date(a.deadlineAt!).getTime() - new Date(b.deadlineAt!).getTime());

  return {
    missed,
    today,
    dueSoon,
    upcoming,
    inbox,
    doneToday,
    doneOlder,
  };
}
