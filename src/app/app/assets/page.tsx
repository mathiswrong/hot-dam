"use client";

import { useEffect, useState, useCallback } from "react";
import { SyncButton } from "../SyncButton";
import { AssetGrid } from "@/components/AssetGrid";
import { LoadingBar } from "@/components/LoadingBar";

const VIEW_KEY = "hotdam-assets-view";
const PAGE_SIZE = 48;

type Asset = {
  meta: {
    id: string;
    path: string;
    title: string;
    tags: string[];
  };
  path: string;
};

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
        <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
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

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_KEY) as "grid" | "list" | null;
    if (stored === "grid" || stored === "list") setView(stored);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  function setViewAndStore(v: "grid" | "list") {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  const load = useCallback(async (offset: number, append: boolean) => {
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));
    if (searchDebounced.trim()) params.set("search", searchDebounced.trim());
    const res = await fetch(`/api/assets?${params}`, { cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const list = data.assets ?? [];
    const totalCount = data.total ?? 0;
    if (append) {
      setAssets((prev) => (offset === 0 ? list : [...prev, ...list]));
    } else {
      setAssets(list);
    }
    setTotal(totalCount);
    return { list, total: totalCount };
  }, [searchDebounced]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    load(0, false).catch((e) => setError(e?.message ?? String(e))).finally(() => setLoading(false));
  }, [load]);

  const loadMore = () => {
    if (loadingMore || assets.length >= total) return;
    setLoadingMore(true);
    load(assets.length, true).finally(() => setLoadingMore(false));
  };

  return (
    <div className="space-y-6">
      <LoadingBar show={loading || loadingMore} />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            All Assets
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Everything in your Hot DAM Dropbox folder
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-slate-800 bg-slate-950/40 text-xs">
            <button
              type="button"
              onClick={() => setViewAndStore("grid")}
              className={`rounded-l-full px-3 py-1.5 font-medium transition ${
                view === "grid"
                  ? "bg-slate-800 text-slate-50"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
              aria-pressed={view === "grid"}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewAndStore("list")}
              className={`rounded-r-full px-3 py-1.5 font-medium transition ${
                view === "list"
                  ? "bg-slate-800 text-slate-50"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
              aria-pressed={view === "list"}
            >
              List
            </button>
          </div>
          <input
            type="search"
            placeholder="Search by name or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
          />
          <SyncButton />
        </div>
      </header>

      {loading && <AssetGridSkeleton view={view} />}

      {error && !loading && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/60 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && assets.length === 0 && !error && (
        <div className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40 py-16 text-center">
          <p className="text-slate-400">
            No assets found. Put files in{" "}
            <code className="rounded-lg bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
              Hot DAM/assets
            </code>{" "}
            in Dropbox, then click &quot;Refresh from Dropbox&quot;.
          </p>
        </div>
      )}

      {!loading && assets.length > 0 && (
        <>
          <AssetGrid assets={assets} view={view} />
          {assets.length < total && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-brand rounded-xl bg-gradient-to-r from-brand-500 to-amber-400 px-6 py-3 text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-50"
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

