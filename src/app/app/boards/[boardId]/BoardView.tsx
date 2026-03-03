"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AssetGrid } from "@/components/AssetGrid";
import { UploadButton } from "@/components/UploadButton";
import { ShareBoardButton } from "@/components/ShareBoardButton";
import { LoadingBar } from "@/components/LoadingBar";

const VIEW_KEY = "hotdam-assets-view";

interface Asset {
  meta: {
    id: string;
    path: string;
    title: string;
    tags: string[];
    boards: string[];
  };
  path: string;
}

const PAGE_SIZE = 48;

export function BoardView({
  boardId,
  boardName,
  initialAssets,
  initialTotal = 0,
}: {
  boardId: string;
  boardName: string;
  initialAssets: Asset[];
  initialTotal?: number;
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_KEY) as "grid" | "list" | null;
    if (stored === "grid" || stored === "list") setView(stored);
  }, []);

  function setViewAndStore(v: "grid" | "list") {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  function baseParams() {
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_SIZE));
    if (boardId === "uncategorized") params.set("uncategorized", "true");
    else if (boardId !== "all") params.set("boardId", boardId);
    if (search) params.set("search", search);
    return params;
  }

  async function refresh() {
    setLoading(true);
    try {
      const params = baseParams();
      params.set("offset", "0");
      const res = await fetch(`/api/assets?${params}`);
      const data = await res.json();
      if (res.ok) {
        setAssets(data.assets ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (loadingMore || assets.length >= total) return;
    setLoadingMore(true);
    try {
      const params = baseParams();
      params.set("offset", String(assets.length));
      const res = await fetch(`/api/assets?${params}`);
      const data = await res.json();
      if (res.ok) setAssets((prev) => [...prev, ...(data.assets ?? [])]);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    if (!search.trim()) return;
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <LoadingBar show={loading || loadingMore} />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/app"
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            ← Boards
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {boardName}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-600">
            <button
              type="button"
              onClick={() => setViewAndStore("grid")}
              className={`rounded-l-lg px-3 py-2 text-sm font-medium transition ${
                view === "grid"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
              }`}
              aria-pressed={view === "grid"}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewAndStore("list")}
              className={`rounded-r-lg px-3 py-2 text-sm font-medium transition ${
                view === "list"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
              }`}
              aria-pressed={view === "list"}
            >
              List
            </button>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or tag…"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          {boardId !== "all" && boardId !== "uncategorized" && (
            <>
              <UploadButton boardId={boardId} onUploaded={refresh} />
              <ShareBoardButton boardId={boardId} boardName={boardName} />
            </>
          )}
        </div>
      </div>

      {loading ? (
        <AssetGridSkeleton view={view} />
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400">
            No assets yet. Drop files into your Dropbox folder and click
            &quot;Refresh from Dropbox&quot; on the Boards page.
          </p>
          {boardId !== "all" && boardId !== "uncategorized" && (
            <UploadButton boardId={boardId} onUploaded={refresh} className="mt-4" />
          )}
        </div>
      ) : (
        <>
          <AssetGrid assets={assets} view={view} />
          {assets.length < total && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-brand rounded-xl px-6 py-3 disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : `Load more (${assets.length} of ${total})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AssetGridSkeleton({ view }: { view: "grid" | "list" }) {
  const count = view === "list" ? 10 : 24;
  if (view === "list") {
    return (
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-600" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-600" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
            </div>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="aspect-square animate-pulse bg-slate-200 dark:bg-slate-600" />
          <div className="space-y-1 p-2">
            <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-600" />
            <div className="h-2 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
