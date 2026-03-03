"use client";

import { useState } from "react";
import { CopyToast } from "@/components/CopyToast";

export function ShareBoardButton({
  boardId,
  boardName,
}: {
  boardId: string;
  boardName: string;
}) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [allowDownload, setAllowDownload] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  async function createShare() {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "board",
        targetId: boardId,
        allowDownload: allowDownload,
      }),
    });
    const data = await res.json();
    if (res.ok) setShareUrl(data.url);
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2000);
    } catch {}
  }

  if (shareUrl) {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="button"
            onClick={copyLink}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              copied ? "bg-emerald-500 text-white" : "btn-brand"
            }`}
          >
            {copied ? "✓ Copied" : "Copy link"}
          </button>
        </div>
        <CopyToast show={showToast} onDone={() => setShowToast(false)} />
      </>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          checked={allowDownload}
          onChange={(e) => setAllowDownload(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Allow downloads
      </label>
      <button
        type="button"
        onClick={createShare}
        className="btn-brand rounded-xl px-4 py-2 text-sm"
      >
        Share board
      </button>
    </div>
  );
}
