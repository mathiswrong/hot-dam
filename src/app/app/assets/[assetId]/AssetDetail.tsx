"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CopyToast } from "@/components/CopyToast";

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|avi)$/i;

interface Asset {
  meta: {
    id: string;
    path: string;
    title: string;
    tags: string[];
    boards: string[];
    comments: { id: string; authorName: string; text: string; createdAt: string }[];
  };
  path: string;
}

export function AssetDetail({ asset }: { asset: Asset }) {
  const [meta, setMeta] = useState(asset.meta);
  const [newTag, setNewTag] = useState("");
  const [newComment, setNewComment] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLinkId, setShareLinkId] = useState<string | null>(null);
  const [shareAllowDownload, setShareAllowDownload] = useState(true);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(meta.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const isImage = IMAGE_EXT.test(meta.path);
  const isVideo = VIDEO_EXT.test(meta.path);
  const downloadUrl = `/api/download?path=${encodeURIComponent(asset.path)}`;

  async function addTag(e: React.FormEvent) {
    e.preventDefault();
    const tag = newTag.trim().toLowerCase();
    if (!tag || meta.tags.includes(tag)) return;
    const tags = [...meta.tags, tag];
    const res = await fetch(`/api/assets/${meta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
    if (res.ok) {
      const data = await res.json();
      setMeta(data.asset.meta);
      setNewTag("");
    }
  }

  function removeTag(tag: string) {
    const tags = meta.tags.filter((t) => t !== tag);
    fetch(`/api/assets/${meta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    }).then((res) => {
      if (res.ok) res.json().then((data) => setMeta(data.asset.meta));
    });
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) return;
    const res = await fetch(`/api/assets/${meta.id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = await res.json();
      setMeta((m) => ({
        ...m,
        comments: [...m.comments, data.comment],
      }));
      setNewComment("");
    }
  }

  async function createShareLink() {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "asset",
        targetId: meta.id,
        allowDownload: shareAllowDownload,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setShareUrl(data.url);
      setShareLinkId(data.link?.id);
    }
  }

  async function updateShareAllowDownload(allow: boolean) {
    if (!shareLinkId) return;
    await fetch(`/api/links/${shareLinkId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowDownload: allow }),
    });
    setShareAllowDownload(allow);
  }

  async function saveTitle() {
    const trimmed = titleValue.trim();
    if (!trimmed || trimmed === meta.title) {
      setEditingTitle(false);
      setTitleValue(meta.title);
      return;
    }
    const res = await fetch(`/api/assets/${meta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    if (res.ok) {
      const data = await res.json();
      setMeta(data.asset.meta);
      setTitleValue(trimmed);
    }
    setEditingTitle(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/assets/${meta.id}`, { method: "DELETE" });
      if (res.ok) router.push("/app/assets");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
          {isImage && !previewFailed && (
            <img
              src={`/api/thumbnail?path=${encodeURIComponent(asset.path)}&size=large`}
              alt={meta.title}
              className="w-full"
              onError={() => setPreviewFailed(true)}
            />
          )}
          {(isImage && previewFailed) || (!isImage && !isVideo) ? (
            <div className="flex aspect-video items-center justify-center text-6xl text-slate-400 dark:text-slate-500">
              {isImage ? "🖼️" : "📄"}
            </div>
          ) : null}
          {isVideo && (
            <video
              src={downloadUrl}
              controls
              className="w-full"
            />
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href={downloadUrl}
            download
            className="btn-brand rounded-xl px-4 py-2"
          >
            Download
          </a>
          <button
            onClick={createShareLink}
            className="rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-600 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:bg-brand-950/30"
          >
            Share
          </button>
        </div>
      </div>

      <div className="w-full space-y-6 lg:w-80">
        <div>
          {editingTitle ? (
            <div className="space-y-2">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") {
                    setTitleValue(meta.title);
                    setEditingTitle(false);
                  }
                }}
                autoFocus
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-lg font-semibold text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
              <p className="text-xs text-slate-500">Press Enter to save, Escape to cancel</p>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {meta.title}
              </h2>
              <button
                type="button"
                onClick={() => setEditingTitle(true)}
                className="shrink-0 rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              >
                Rename
              </button>
            </div>
          )}
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {asset.path}
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm text-red-600 hover:underline dark:text-red-400"
            >
              Delete asset
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Tags
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-sm dark:bg-slate-600"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <form onSubmit={addTag} className="mt-2 flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <button type="submit" className="btn-brand rounded-xl px-3 py-1.5 text-sm">
              Add
            </button>
          </form>
        </div>

        {shareUrl && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Share link
            </p>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!shareUrl) return;
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    setShareCopied(true);
                    setShowShareToast(true);
                    setTimeout(() => {
                      setShareCopied(false);
                      setShowShareToast(false);
                    }, 2000);
                  } catch {}
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  shareCopied ? "bg-emerald-500 text-white" : "btn-brand"
                }`}
              >
                {shareCopied ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={shareAllowDownload}
                onChange={(e) => updateShareAllowDownload(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Allow downloads
            </label>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Comments
          </h3>
          <div className="mt-2 space-y-2">
            {meta.comments.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"
              >
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {c.authorName}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {c.text}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={addComment} className="mt-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment…"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <button type="submit" className="btn-brand mt-2 rounded-xl px-3 py-1.5 text-sm">
              Comment
            </button>
          </form>
        </div>
      </div>
      <CopyToast show={showShareToast} onDone={() => setShowShareToast(false)} />
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" aria-hidden onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete this asset?</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              The file will be removed from your Dropbox. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
