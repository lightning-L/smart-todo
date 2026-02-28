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
import { usePathname, useRouter } from "next/navigation";
import { useUiStore } from "@/store/ui-store";

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

export function MonthCalendar() {
  const router = useRouter();
  const pathname = usePathname();
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
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="上一月"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-slate-800">
          {format(selectedDate, "yyyy年M月", { locale: zhCN })}
        </span>
        <button
          type="button"
          onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="下一月"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-[11px] font-medium uppercase tracking-wider text-slate-400"
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
              onClick={() => {
                setSelectedDate(d);
                if (pathname !== "/") router.push("/");
              }}
              className={`rounded-lg py-2 text-sm font-medium transition-all duration-150 ${
                selected
                  ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
                  : inMonth
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-slate-400 hover:bg-slate-50"
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
