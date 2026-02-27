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
          className="z-50 w-64 rounded-lg border border-white/10 bg-zinc-900/95 p-3 shadow-lg backdrop-blur"
          sideOffset={4}
        >
          <div className="mb-2 text-xs font-medium text-zinc-400">{label}</div>
          <input
            type="datetime-local"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="mb-3 w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-foreground"
          />
          <div className="flex justify-end gap-2">
            {allowClear && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              >
                清除
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="rounded bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300 hover:bg-cyan-500/30"
            >
              确定
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
