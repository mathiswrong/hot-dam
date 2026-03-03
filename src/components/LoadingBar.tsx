"use client";

import { useEffect, useState } from "react";

/**
 * Thin indeterminate progress bar at the top of the viewport.
 * Use when a page or section is loading (e.g. fetching assets, loading more).
 */
export function LoadingBar({ show }: { show: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!show || !mounted) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[100] h-0.5 overflow-hidden bg-slate-200 dark:bg-slate-700"
      role="progressbar"
      aria-valuetext="Loading"
    >
      <div className="h-full w-1/3 min-w-[120px] animate-loading-bar rounded-full bg-brand-500" />
    </div>
  );
}
