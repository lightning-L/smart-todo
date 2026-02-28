"use client";

import { useState, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import { format, parseISO } from "date-fns";

function toInputValue(iso: string | undefined): string {
  if (!iso) return "";
  try {
    const d = parseISO(iso);
    return format(d, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return "";
  }
}

function fromInputValue(s: string): string | null {
  if (!s.trim()) return null;
  try {
    return new Date(s).toISOString();
  } catch {
    return null;
  }
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
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(toInputValue(value));

  const handleOpen = useCallback(() => {
    setInputVal(toInputValue(value));
    setOpen(true);
  }, [value]);

  const handleSave = useCallback(() => {
    const next = fromInputValue(inputVal);
    onChange(next);
    setOpen(false);
  }, [inputVal, onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setOpen(false);
  }, [onChange]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild onClick={handleOpen}>
        {trigger}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-64 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xl"
          sideOffset={4}
        >
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
          <input
            type="datetime-local"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
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
              className="rounded bg-cyan-100 px-2 py-1 text-xs text-cyan-700 hover:bg-cyan-200"
            >
              确定
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
