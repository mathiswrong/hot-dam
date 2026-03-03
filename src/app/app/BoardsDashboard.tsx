"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SyncButton } from "./SyncButton";
import { LoadingBar } from "@/components/LoadingBar";

const VIEW_KEY = "hotdam-boards-view";

type Board = {
  id: string;
  name: string;
  description?: string;
  coverPath?: string;
  order?: number;
};

export function BoardsDashboard({ boards: initialBoards }: { boards: Board[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [boards, setBoards] = useState(initialBoards);
  const [loading, setLoading] = useState(false);
  const [editBoard, setEditBoard] = useState<Board | null>(null);
  const [deleteBoardId, setDeleteBoardId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    setBoards(initialBoards);
  }, [initialBoards]);

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_KEY) as "grid" | "list" | null;
    if (stored === "grid" || stored === "list") setView(stored);
  }, []);

  async function refetchBoards() {
    setLoading(true);
    try {
      const res = await fetch("/api/boards");
      if (res.ok) {
        const data = await res.json();
        setBoards(data.boards ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePatchBoard(boardId: string, updates: { name?: string; description?: string; order?: number }) {
    const res = await fetch(`/api/boards/${boardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      setEditBoard(null);
      await refetchBoards();
    }
  }

  async function handleDeleteBoard(boardId: string) {
    const res = await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteBoardId(null);
      setMenuOpenId(null);
      await refetchBoards();
    }
  }

  async function handleMove(boardId: string, direction: "up" | "down") {
    const idx = boards.findIndex((b) => b.id === boardId);
    if (idx < 0) return;
    const orders = boards.map((b) => b.order ?? 999);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= boards.length) return;
    const o1 = orders[idx];
    const o2 = orders[swapIdx];
    await Promise.all([
      fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: o2 }),
      }),
      fetch(`/api/boards/${boards[swapIdx].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: o1 }),
      }),
    ]);
    setMenuOpenId(null);
    await refetchBoards();
  }

  function setViewAndStore(v: "grid" | "list") {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  const allAssetsCard = {
    href: "/app/assets",
    name: "All Assets",
    description: "Every asset in your library",
    coverPath: undefined as string | undefined,
    icon: "📁",
    id: "",
  };
  const uncategorizedCard = {
    href: "/app/uncategorized",
    name: "Uncategorized",
    description: "Assets not in any album",
    coverPath: undefined as string | undefined,
    icon: "📋",
    id: "",
  };
  const allCards = [
    allAssetsCard,
    uncategorizedCard,
    ...boards.map((b) => ({ ...b, href: `/app/boards/${b.id}`, icon: "🖼️" as const })),
  ];

  return (
    <div className="space-y-6">
      <LoadingBar show={loading} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            Boards
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Organize and share your assets
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
          <SyncButton />
        </div>
      </div>

      {view === "list" ? (
        <ul className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-950/60">
          {allCards.map((card) => (
            <li key={card.href}>
              {card.id ? (
                <div className="flex items-center gap-2 px-1">
                  <Link
                    href={card.href}
                    className="flex min-w-0 flex-1 items-center gap-4 px-3 py-3 transition hover:bg-slate-900"
                  >
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900">
                      {card.coverPath ? (
                        <>
                          <img
                            src={`/api/thumbnail?path=${encodeURIComponent(card.coverPath)}`}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              const next = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                              if (next) next.style.display = "flex";
                            }}
                          />
                          <div className="absolute inset-0 hidden items-center justify-center bg-slate-100 text-2xl dark:bg-slate-700" aria-hidden>
                            {card.icon}
                          </div>
                        </>
                      ) : (
                        <span className="text-2xl">{card.icon}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-50">
                        {card.name}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {card.description}
                      </p>
                    </div>
                  </Link>
                  <BoardMenu
                    board={card}
                    boards={boards}
                    open={menuOpenId === card.id}
                    onToggle={() => setMenuOpenId(menuOpenId === card.id ? null : card.id)}
                    onEdit={() => { setEditBoard(card); setMenuOpenId(null); }}
                    onDelete={() => { setDeleteBoardId(card.id); setMenuOpenId(null); }}
                    onMoveUp={() => handleMove(card.id, "up")}
                    onMoveDown={() => handleMove(card.id, "down")}
                  />
                </div>
              ) : (
                <Link
                  href={card.href}
                  className="flex items-center gap-4 px-3 py-3 transition hover:bg-slate-900"
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900">
                    <span className="text-2xl">{card.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-50">{card.name}</p>
                    <p className="truncate text-xs text-slate-400">{card.description}</p>
                  </div>
                </Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allCards.map((card) => (
            <div key={card.href} className="relative group/card">
              {card.id ? (
                <>
                  <Link
                    href={card.href}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg shadow-black/40 transition hover:border-brand-400/70 hover:shadow-2xl"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-slate-900">
                      {card.coverPath ? (
                        <>
                          <img
                            src={`/api/thumbnail?path=${encodeURIComponent(card.coverPath)}`}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition group-hover/card:scale-[1.02]"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              const next = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                              if (next) next.style.display = "flex";
                            }}
                          />
                          <div className="absolute inset-0 hidden items-center justify-center bg-slate-100 text-4xl dark:bg-slate-700" aria-hidden>
                            {card.icon}
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl transition group-hover/card:scale-105">
                          {card.icon}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="text-sm font-semibold text-slate-50 group-hover/card:text-amber-300">
                        {card.name}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {card.description}
                      </p>
                    </div>
                  </Link>
                  <div className="absolute right-2 top-2">
                    <BoardMenu
                      board={card}
                      boards={boards}
                      open={menuOpenId === card.id}
                      onToggle={(e) => { e?.preventDefault(); e?.stopPropagation(); setMenuOpenId(menuOpenId === card.id ? null : card.id); }}
                      onEdit={() => { setEditBoard(card); setMenuOpenId(null); }}
                      onDelete={() => { setDeleteBoardId(card.id); setMenuOpenId(null); }}
                      onMoveUp={() => handleMove(card.id, "up")}
                      onMoveDown={() => handleMove(card.id, "down")}
                    />
                  </div>
                </>
              ) : (
                <Link
                  href={card.href}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg shadow-black/40 transition hover:border-brand-400/70 hover:shadow-2xl"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-slate-900">
                    <div className="flex h-full w-full items-center justify-center text-4xl transition group-hover:scale-105">
                      {card.icon}
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-sm font-semibold text-slate-50 group-hover:text-amber-300">
                      {card.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {card.description}
                    </p>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link
          href="/app/boards/new"
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-800 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-brand-400 hover:bg-slate-900/80"
        >
          <span className="text-lg">+</span>
          New board
        </Link>
      </div>

      {editBoard && (
        <EditBoardModal
          board={editBoard}
          onSave={(name, description) => handlePatchBoard(editBoard.id, { name, description })}
          onClose={() => setEditBoard(null)}
        />
      )}
      {deleteBoardId && (
        <ConfirmModal
          title="Delete board?"
          message="This only removes the board from Hot DAM. Your files in Dropbox are not deleted."
          confirmLabel="Delete"
          onConfirm={() => handleDeleteBoard(deleteBoardId)}
          onCancel={() => setDeleteBoardId(null)}
        />
      )}
    </div>
  );
}

function BoardMenu({
  board,
  boards,
  open,
  onToggle,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  board: { id: string; name: string };
  boards: Board[];
  open: boolean;
  onToggle: (e?: React.MouseEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const idx = boards.findIndex((b) => b.id === board.id);
  const canMoveUp = idx > 0;
  const canMoveDown = idx >= 0 && idx < boards.length - 1;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="sr-only">Menu</span>
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" aria-hidden onClick={onToggle} />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800">
            <button
              type="button"
              onClick={onEdit}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Rename
            </button>
            {canMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Move up
              </button>
            )}
            {canMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Move down
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Delete board
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function EditBoardModal({
  board,
  onSave,
  onClose,
}: {
  board: Board;
  onSave: (name: string, description: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(name.trim(), description.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" aria-hidden onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Edit board</h3>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-600">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-brand rounded-xl px-4 py-2 text-sm disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);
  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" aria-hidden onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-600">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
