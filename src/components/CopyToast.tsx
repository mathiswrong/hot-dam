"use client";

import { useEffect, useState } from "react";

export function CopyToast({ show, onDone }: { show: boolean; onDone: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!show) return;
    setMounted(true);
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [show, onDone]);

  if (!show || !mounted) return null;
  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 shadow-lg dark:border-emerald-800 dark:bg-emerald-900/90 dark:text-emerald-100"
      role="status"
      aria-live="polite"
    >
      ✓ Link copied to clipboard
    </div>
  );
}
