"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBoardPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          folderPath: folderPath.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/app/boards/${data.board.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        New board
      </h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholder="e.g. Spring 2026 Campaign"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            rows={2}
            placeholder="Optional description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Dropbox folder path (optional)
          </label>
          <input
            type="text"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholder="/Hot DAM/assets/campaign-name"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Files dropped in this folder will auto-join this board
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create board"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
