"use client";

import { useEffect, useRef } from "react";
import { runAutoArchive } from "@/lib/archive";

/** Runs auto-archive once per session on mount. */
export function AutoArchiveOnLoad() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    runAutoArchive().catch(() => {});
  }, []);
  return null;
}
