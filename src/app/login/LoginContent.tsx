"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function DropboxIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z" />
    </svg>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="pointer-events-none absolute inset-x-[-20%] top-[-10%] -z-10 h-64 bg-[radial-gradient(circle_at_top,_#f97316_0,_rgba(15,23,42,0)_65%)] opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-30%] -z-10 h-72 bg-[radial-gradient(circle_at_bottom,_#22c55e_0,_rgba(15,23,42,0)_65%)] opacity-60" />
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/60 backdrop-blur">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 via-brand-500 to-amber-500 text-xs font-black uppercase tracking-[0.14em] text-slate-950">
            HD
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-50">
              Hot DAM
            </h1>
            <p className="text-xs text-slate-400">
              The D.A.M. your Dropbox craves
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-950/60 p-3 text-sm text-red-300 border border-red-500/40">
            {error === "invalid_state" && "Invalid OAuth state. Please try again."}
            {error === "config" && "Server configuration error. Contact support."}
            {!["invalid_state", "config"].includes(error) && `Error: ${error}`}
          </div>
        )}

        <a
          href="/api/auth/dropbox"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0061ff] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0052d9] focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          <DropboxIcon />
          Connect with Dropbox
        </a>

        <p className="mt-6 text-center text-xs text-slate-400">
          By connecting, you allow Hot DAM to access your Dropbox files. Your
          data stays in your Dropbox.
        </p>

        <Link
          href="/"
          className="mt-4 block text-center text-xs text-slate-400 hover:text-slate-100"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

export function LoginContent() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-slate-500">Loading…</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
