import { nanoid } from "nanoid";
import { db } from "./db";
import type { DailyLog } from "./types";
import { format } from "date-fns";
import { pushDailyLog } from "./sync";

const now = () => new Date().toISOString();

export async function createDailyLog(
  taskId: string,
  date: string,
  did: boolean,
  note?: string
): Promise<DailyLog> {
  const ts = now();
  const log: DailyLog = {
    id: nanoid(),
    taskId,
    date,
    did,
    note,
    createdAt: ts,
    updatedAt: ts,
  };
  await db.dailyLogs.add(log);
  await pushDailyLog(log);
  return log;
}

export async function getLogsForTask(taskId: string): Promise<DailyLog[]> {
  return db.dailyLogs.where("taskId").equals(taskId).reverse().sortBy("date");
}

export async function getLogForTaskOnDate(
  taskId: string,
  date: string
): Promise<DailyLog | undefined> {
  return db.dailyLogs.where("[taskId+date]").equals([taskId, date]).first();
}

export function todayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}
