"use client";

import { Circle, FolderTree, Repeat, Activity } from "lucide-react";
import type { TaskType } from "@/lib/types";

const iconSize = 14;

const config: Record<
  TaskType,
  { label: string; short: string; icon: typeof Circle; pillClass: string; iconClass: string }
> = {
  task: {
    label: "普通任务",
    short: "任务",
    icon: Circle,
    pillClass: "bg-slate-100 text-slate-600 border border-slate-200/80",
    iconClass: "text-slate-500",
  },
  project: {
    label: "项目",
    short: "项目",
    icon: FolderTree,
    pillClass: "bg-blue-50 text-blue-700 border border-blue-200/80",
    iconClass: "text-blue-600",
  },
  habit_daily: {
    label: "每日打卡",
    short: "打卡",
    icon: Repeat,
    pillClass: "bg-cyan-50 text-cyan-700 border border-cyan-200/80",
    iconClass: "text-cyan-600",
  },
  ongoing: {
    label: "每日推进",
    short: "推进",
    icon: Activity,
    pillClass: "bg-violet-50 text-violet-700 border border-violet-200/80",
    iconClass: "text-violet-600",
  },
};

interface TaskTypeIconProps {
  type: TaskType;
}

export function TaskTypeIcon({ type }: TaskTypeIconProps) {
  const { label, short, icon: Icon, pillClass, iconClass } = config[type];

  return (
    <span
      className={`inline-flex h-[22px] shrink-0 items-center gap-1 rounded-full px-2 text-xs font-medium ${pillClass}`}
      aria-label={label}
    >
      <Icon size={iconSize} className={iconClass} aria-hidden />
      <span>{short}</span>
    </span>
  );
}
