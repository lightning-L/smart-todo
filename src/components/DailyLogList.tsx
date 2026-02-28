"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getLogsForTask } from "@/lib/daily-log-crud";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

interface DailyLogListProps {
  taskId: string;
}

export function DailyLogList({ taskId }: DailyLogListProps) {
  const logs = useLiveQuery(() => getLogsForTask(taskId), [taskId]);

  if (logs === undefined) return null;
  if (logs.length === 0) {
    return <p className="text-sm text-zinc-500">暂无记录</p>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {logs.map((log) => (
        <li
          key={log.id}
          className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 text-sm shadow-sm"
        >
          <span className="text-zinc-500">
            {format(parseISO(log.date), "M月d日", { locale: zhCN })}
          </span>
          {log.did && <span className="text-cyan-600">✓</span>}
          {log.note && <span className="truncate text-foreground">{log.note}</span>}
        </li>
      ))}
    </ul>
  );
}
