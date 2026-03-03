import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link
            href="/app"
            className="flex items-center gap-3 rounded-lg py-1 pr-2 transition hover:opacity-90"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 via-brand-500 to-amber-500 text-xs font-black uppercase tracking-[0.14em]">
              HD
            </div>
            <div>
              <span className="block text-sm font-semibold tracking-tight text-slate-50">
                Hot DAM
              </span>
              <span className="hidden text-[11px] text-slate-400 sm:block">
                The D.A.M. your Dropbox craves
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/app"
              className="rounded-full px-3 py-1.5 font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              Boards
            </Link>
            <Link
              href="/app/links"
              className="rounded-full px-3 py-1.5 font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              Share links
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              >
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
