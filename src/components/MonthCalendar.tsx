"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { useUiStore } from "@/store/ui-store";

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

export function MonthCalendar() {
  const { selectedDate, setSelectedDate } = useUiStore();
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const rows: Date[] = [];
  for (let d = calStart; d <= calEnd; d = addDays(d, 1)) {
    rows.push(d);
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
          className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          aria-label="上一月"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-foreground">
          {format(selectedDate, "yyyy年M月", { locale: zhCN })}
        </span>
        <button
          type="button"
          onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
          className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          aria-label="下一月"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-xs font-medium text-zinc-500"
          >
            {label}
          </div>
        ))}
        {rows.map((d) => {
          const inMonth = isSameMonth(d, selectedDate);
          const selected = isSameDay(d, selectedDate);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => setSelectedDate(d)}
              className={`rounded py-1.5 text-sm transition-colors ${
                selected
                  ? "bg-cyan-500/30 text-cyan-200 ring-1 ring-cyan-400/50"
                  : inMonth
                    ? "text-foreground hover:bg-white/10"
                    : "text-zinc-600 hover:bg-white/5"
              }`}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
