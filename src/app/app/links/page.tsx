"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyToast } from "@/components/CopyToast";

type ShareLinkItem = {
  id: string;
  type: string;
  targetId: string;
  createdAt: string;
  permissions: { allowDownload: boolean };
  url: string;
};

export default function ShareLinksPage() {
  const [links, setLinks] = useState<ShareLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/links");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setLinks(data.links ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function copyUrl(link: ShareLinkItem) {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedId(link.id);
      setShowCopyToast(true);
      setTimeout(() => {
        setCopiedId(null);
        setShowCopyToast(false);
      }, 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  async function toggleDownload(link: ShareLinkItem) {
    const next = !link.permissions.allowDownload;
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowDownload: next }),
      });
      if (!res.ok) throw new Error(await res.text());
      setLinks((prev) =>
        prev.map((l) =>
          l.id === link.id
            ? { ...l, permissions: { ...l.permissions, allowDownload: next } }
            : l
        )
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Share links
        </h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Public links to boards. Toggle download permission per link.
        </p>
      </div>

      {loading && (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
          Loading share links…
        </div>
      )}

      {error && !loading && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && links.length === 0 && !error && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/30">
          <p className="text-slate-500 dark:text-slate-400">
            No share links yet. Create one from a board: open a board, then use
            &quot;Share&quot; to generate a public link.
          </p>
          <Link
            href="/app"
            className="mt-4 inline-block text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Go to Boards →
          </Link>
        </div>
      )}

      {!loading && links.length > 0 && (
        <ul className="space-y-4">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-nowrap"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm text-slate-700 dark:text-slate-300">
                  {link.url}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {link.type} · {link.targetId} · created{" "}
                  {new Date(link.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={link.permissions.allowDownload}
                    onChange={() => toggleDownload(link)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Allow download
                </label>
                <button
                  type="button"
                  onClick={() => copyUrl(link)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    copiedId === link.id
                      ? "bg-emerald-500 text-white"
                      : "btn-brand"
                  }`}
                >
                  {copiedId === link.id ? "✓ Copied" : "Copy link"}
                </button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Open
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
      <CopyToast show={showCopyToast} onDone={() => setShowCopyToast(false)} />
    </div>
  );
}
