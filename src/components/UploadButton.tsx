"use client";

import { useRef, useState } from "react";

export function UploadButton({
  boardId,
  onUploaded,
  className = "",
}: {
  boardId: string;
  onUploaded?: () => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.set("file", files[i]);
        formData.set("boardId", boardId);
        await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      }
      onUploaded?.();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </div>
  );
}
