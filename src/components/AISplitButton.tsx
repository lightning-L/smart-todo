"use client";

import { useState } from "react";
import { AISplitDialog } from "./AISplitDialog";

interface AISplitButtonProps {
  rootId: string;
  rootTitle: string;
  rootDescription?: string;
  deadlineAt?: string;
  onInserted?: () => void;
}

export function AISplitButton({ rootId, rootTitle, rootDescription, deadlineAt, onInserted }: AISplitButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-cyan-500/40 bg-cyan-100 px-2 py-1 text-xs text-cyan-700 hover:bg-cyan-200"
      >
        AI 帮我拆解
      </button>
      <AISplitDialog
        open={open}
        onOpenChange={setOpen}
        rootId={rootId}
        rootTitle={rootTitle}
        rootDescription={rootDescription}
        deadlineAt={deadlineAt}
        onInserted={onInserted ?? (() => {})}
      />
    </>
  );
}
