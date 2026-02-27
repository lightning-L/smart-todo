"use client";

import { useState } from "react";
import { AISplitDialog } from "./AISplitDialog";

interface AISplitButtonProps {
  rootId: string;
  rootTitle: string;
  onInserted?: () => void;
}

export function AISplitButton({ rootId, rootTitle, onInserted }: AISplitButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20"
      >
        AI 帮我拆解
      </button>
      <AISplitDialog
        open={open}
        onOpenChange={setOpen}
        rootId={rootId}
        rootTitle={rootTitle}
        onInserted={onInserted ?? (() => {})}
      />
    </>
  );
}
