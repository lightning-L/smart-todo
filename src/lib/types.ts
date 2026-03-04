export type TaskType = "task" | "project" | "habit_daily" | "ongoing";
export type TaskStatus = "active" | "completed" | "archived";

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;

  parentId?: string;

  scheduledAt?: string;
  deadlineAt?: string;
  completedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  id: string;
  taskId: string;
  date: string;
  did: boolean;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}
