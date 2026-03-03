"use client";

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|avi)$/i;

export function PublicShareView({
  data,
  linkId,
}: {
  data: {
    link: { type: string; targetId: string; permissions: { allowDownload: boolean } };
    board?: { name: string };
    assets?: { meta: { id: string; path: string; title: string }; path: string }[];
    asset?: { meta: { id: string; path: string; title: string }; path: string };
  };
  linkId: string;
}) {
  const { link } = data;
  const allowDownload = link.permissions.allowDownload;
  const linkParam = `&linkId=${encodeURIComponent(linkId)}`;

  if (link.type === "board" && data.board && data.assets) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
              H
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Hot DAM
              </h1>
              <p className="text-xs text-brand-600 dark:text-brand-400">
                the D.A.M. your Dropbox craves · {data.board.name}
              </p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {data.assets.map(({ meta, path }) => (
              <PublicAssetCard
                key={meta.id}
                meta={meta}
                path={path}
                allowDownload={allowDownload}
                linkId={linkId}
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (link.type === "asset" && data.asset) {
    const { meta, path } = data.asset;
    const isImage = IMAGE_EXT.test(path);
    const isVideo = VIDEO_EXT.test(path);
    const downloadUrl = `/api/download?path=${encodeURIComponent(path)}${linkParam}`;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
              H
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Hot DAM
              </h1>
              <p className="text-xs text-brand-600 dark:text-brand-400">
                the D.A.M. your Dropbox craves · {meta.title}
              </p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            {isImage && (
              <img
                src={`/api/thumbnail?path=${encodeURIComponent(path)}&size=large${linkParam}`}
                alt={meta.title}
                className="w-full"
              />
            )}
            {isVideo && (
              <video src={allowDownload ? downloadUrl : undefined} controls className="w-full" />
            )}
            {!isImage && !isVideo && (
              <div className="flex aspect-video items-center justify-center text-6xl">
                📄
              </div>
            )}
          </div>
          {allowDownload && (
            <a
              href={downloadUrl}
              download
              className="mt-4 inline-block rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600"
            >
              Download
            </a>
          )}
        </main>
      </div>
    );
  }

  return null;
}

function PublicAssetCard({
  meta,
  path,
  allowDownload,
  linkId,
}: {
  meta: { id: string; path: string; title: string };
  path: string;
  allowDownload: boolean;
  linkId: string;
}) {
  const isImage = IMAGE_EXT.test(path);
  const isVideo = VIDEO_EXT.test(path);
  const linkParam = `&linkId=${encodeURIComponent(linkId)}`;
  const thumbUrl =
    isImage || isVideo
      ? `/api/thumbnail?path=${encodeURIComponent(path)}${linkParam}`
      : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="aspect-square bg-slate-100 dark:bg-slate-700">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={meta.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            📄
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
          {meta.title}
        </p>
        {allowDownload && (
          <a
            href={`/api/download?path=${encodeURIComponent(path)}${linkParam}`}
            download
            className="mt-1 block text-sm text-brand-600 hover:underline"
          >
            Download
          </a>
        )}
      </div>
    </div>
  );
}
