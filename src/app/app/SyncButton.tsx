"use client";

import { useState } from "react";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.created > 0 ? `Found ${data.created} new asset(s)` : "Up to date");
        setTimeout(() => setMessage(null), 3000);
        if (data.created > 0) window.location.reload();
      } else {
        setMessage("Sync failed");
      }
    } catch {
      setMessage("Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span className="text-sm text-slate-500 dark:text-slate-400">{message}</span>
      )}
      <button
        onClick={handleSync}
        disabled={loading}
        className="rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:bg-brand-950/30 dark:hover:text-brand-300"
      >
        {loading ? "Syncing…" : "Refresh from Dropbox"}
      </button>
    </div>
  );
}
