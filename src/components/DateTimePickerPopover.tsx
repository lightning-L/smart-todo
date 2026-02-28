"use client";

import { useState, useCallback, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  setHours,
  setMinutes,
  setSeconds,
  endOfDay,
  startOfDay,
} from "date-fns";
import { zhCN } from "date-fns/locale";

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

/** 判断是否为“仅日期”（无具体时间），约定存为当天 23:59 */
function isDateOnly(iso: string | undefined): boolean {
  if (!iso?.trim()) return true;
  try {
    const d = parseISO(iso);
    return d.getHours() === 23 && d.getMinutes() === 59;
  } catch {
    return false;
  }
}

/** 展示用：仅日期显示“3月15日”，带时间显示“3月15日 14:30” */
export function formatDateTimeDisplay(iso: string | undefined): string {
  if (!iso) return "";
  try {
    const d = parseISO(iso);
    if (isDateOnly(iso)) {
      return format(d, "M月d日", { locale: zhCN });
    }
    return format(d, "M月d日 HH:mm", { locale: zhCN });
  } catch {
    return "";
  }
}

function isoToDate(iso: string | undefined): Date | null {
  if (!iso) return null;
  try {
    return parseISO(iso);
  } catch {
    return null;
  }
}

/** 仅日期存为当天 23:59:59（截止日理解为“当天结束前”） */
function toDateOnlyEndOfDay(d: Date): Date {
  return setSeconds(setMinutes(setHours(d, 23), 59), 59);
}

function dateToIso(date: Date, timeEnabled: boolean, timeStr: string): string {
  if (!timeEnabled) {
    return toDateOnlyEndOfDay(date).toISOString();
  }
  if (!timeStr.trim()) {
    return toDateOnlyEndOfDay(date).toISOString();
  }
  const [h, m] = timeStr.split(":").map(Number);
  const withTime = setMinutes(setHours(date, h ?? 0), m ?? 0);
  return setSeconds(withTime, 0).toISOString();
}

interface DateTimePickerPopoverProps {
  value: string | undefined;
  onChange: (iso: string | null) => void;
  label: string;
  allowClear?: boolean;
  trigger: React.ReactNode;
}

export function DateTimePickerPopover({
  value,
  onChange,
  label,
  allowClear = false,
  trigger,
}: DateTimePickerPopoverProps) {
  const initial = useMemo(() => isoToDate(value) ?? startOfDay(new Date()), [value]);
  const [selectedDate, setSelectedDate] = useState(initial);
  const [timeEnabled, setTimeEnabled] = useState(() => !isDateOnly(value ?? ""));
  const [timeStr, setTimeStr] = useState(() => {
    const d = isoToDate(value);
    if (!d || isDateOnly(value ?? "")) return "23:59";
    return format(d, "HH:mm");
  });

  const handleOpen = useCallback(() => {
    const d = isoToDate(value) ?? startOfDay(new Date());
    setSelectedDate(d);
    setTimeEnabled(!isDateOnly(value));
    const parsed = isoToDate(value);
    setTimeStr(parsed ? format(parsed, "HH:mm") : "23:59");
  }, [value]);

  const [open, setOpen] = useState(false);

  const handleSave = useCallback(() => {
    const iso = dateToIso(selectedDate, timeEnabled, timeStr);
    onChange(iso);
    setOpen(false);
  }, [selectedDate, timeEnabled, timeStr, onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setOpen(false);
  }, [onChange]);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const rows: Date[] = [];
  for (let d = calStart; d <= calEnd; d = addDays(d, 1)) {
    rows.push(d);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild onClick={handleOpen}>
        {trigger}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-72 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xl"
          sideOffset={4}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={() => setOpen(false)}
        >
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </div>

          {/* 日期：月历 */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedDate((d) => subMonths(d, 1))}
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
              onClick={() => setSelectedDate((d) => addMonths(d, 1))}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="下一月"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAY_LABELS.map((l) => (
              <div
                key={l}
                className="py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400"
              >
                {l}
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
                  className={`rounded-lg py-1.5 text-sm font-medium transition-all duration-150 ${
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

          {/* 时间可选 */}
          <div className="mb-4 mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={timeEnabled}
                onChange={(e) => setTimeEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm text-slate-700">添加时间</span>
            </label>
            {timeEnabled && (
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            {allowClear && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              >
                清除
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="rounded bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-200"
            >
              确定
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
