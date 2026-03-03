"use client";

import { useState } from "react";
import Link from "next/link";

interface Asset {
  meta: {
    id: string;
    path: string;
    title: string;
    tags: string[];
  };
  path: string;
}

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|avi)$/i;

function ThumbnailOrPlaceholder({
  path,
  title,
  isImageOrVideo,
  className = "",
  masonry = false,
}: {
  path: string;
  title: string;
  isImageOrVideo: boolean;
  className?: string;
  masonry?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const thumbUrl =
    isImageOrVideo && !failed
      ? `/api/thumbnail?path=${encodeURIComponent(path)}`
      : null;

  if (thumbUrl && masonry) {
    return (
      <div className={`overflow-hidden bg-slate-100 dark:bg-slate-700 ${className}`}>
        <img
          src={thumbUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          className="block w-full object-cover transition group-hover:scale-[1.02]"
          style={{ height: "auto", verticalAlign: "middle" }}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`aspect-square bg-slate-100 dark:bg-slate-700 ${className}`}>
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-3xl text-slate-400 dark:text-slate-500">
          {isImageOrVideo ? "🖼️" : "📄"}
        </div>
      )}
    </div>
  );
}

export function AssetGrid({
  assets,
  view = "grid",
  onSetBoardCover,
}: {
  assets: Asset[];
  view?: "grid" | "list";
  /** When set, show "Set as cover" on each asset (for board view). */
  onSetBoardCover?: (assetId: string) => void;
}) {
  if (view === "list") {
    return (
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
        {assets.map(({ meta, path }) => {
          const isImageOrVideo =
            IMAGE_EXT.test(meta.path) || VIDEO_EXT.test(meta.path);
          return (
            <li key={meta.id} className="flex items-center gap-2">
              <Link
                href={`/app/assets/${meta.id}`}
                className="flex min-w-0 flex-1 items-center gap-4 px-4 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <ThumbnailOrPlaceholder
                    path={path}
                    title={meta.title}
                    isImageOrVideo={isImageOrVideo}
                    className="h-12 w-12 shrink-0"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-white">
                    {meta.title}
                  </p>
                  {meta.tags.length > 0 && (
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {meta.tags.join(", ")}
                    </p>
                  )}
                </div>
              </Link>
              {onSetBoardCover && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onSetBoardCover(meta.id);
                  }}
                  className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                >
                  Set as cover
                </button>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="columns-3 gap-2 sm:columns-4 sm:gap-3 md:columns-5 lg:columns-6 space-y-2 sm:space-y-3">
      {assets.map(({ meta, path }) => {
        const isImageOrVideo =
          IMAGE_EXT.test(meta.path) || VIDEO_EXT.test(meta.path);

        return (
          <div
            key={meta.id}
            className="group/card break-inside-avoid relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-brand-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-600"
          >
            <Link href={`/app/assets/${meta.id}`} className="block">
              <ThumbnailOrPlaceholder
                path={path}
                title={meta.title}
                isImageOrVideo={isImageOrVideo}
                className="block w-full min-h-[80px]"
                masonry
              />
              <div className="p-1.5 sm:p-2">
                <p className="truncate text-xs font-medium text-slate-900 dark:text-white sm:text-sm">
                  {meta.title}
                </p>
                {meta.tags.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {meta.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-600 dark:bg-slate-600 dark:text-slate-300 sm:text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
            {onSetBoardCover && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSetBoardCover(meta.id);
                }}
                className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm opacity-0 transition hover:bg-white hover:opacity-100 focus:opacity-100 group-hover/card:opacity-100 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Set as cover
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
