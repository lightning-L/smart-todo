import Dexie, { type Table } from "dexie";
import type { Task, DailyLog } from "./types";

export class TodoDexie extends Dexie {
  tasks!: Table<Task>;
  dailyLogs!: Table<DailyLog>;

  constructor() {
    super("TodoDB");
    this.version(1).stores({
      tasks: "id, status, scheduledAt, deadlineAt, completedAt, parentId, type, createdAt",
      dailyLogs: "id, taskId, date, createdAt",
    });
    this.version(2).stores({
      dailyLogs: "id, taskId, date, [taskId+date], createdAt",
    });
  }
}

export const db = new TodoDexie();
