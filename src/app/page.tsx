import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/app");

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-x-[-20%] top-[-10%] -z-10 h-72 bg-[radial-gradient(circle_at_top,_#f97316_0,_rgba(15,23,42,0)_60%)] opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-40%] -z-10 h-96 bg-[radial-gradient(circle_at_bottom,_#22c55e_0,_rgba(15,23,42,0)_60%)] opacity-60" />

      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 via-brand-500 to-amber-500 text-xs font-black uppercase tracking-[0.12em]">
              HD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight">
                  Hot DAM
                </span>
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300">
                  New
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The D.A.M. your Dropbox craves
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <a href="#features" className="text-slate-300 hover:text-slate-50">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-300 hover:text-slate-50">
              How it works
            </a>
            <a href="#pricing" className="text-slate-300 hover:text-slate-50">
              Pricing
            </a>
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              Sign in
            </Link>
            <a
              href="/api/auth/dropbox"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0061ff] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0052d9] focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              <span className="inline-block h-4 w-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z" />
                </svg>
              </span>
              Connect with Dropbox
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:pt-16">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Dropbox‑native digital asset manager
            </div>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              A simple brand hub,
              <span className="block text-transparent bg-gradient-to-r from-amber-300 via-white to-emerald-300 bg-clip-text">
                powered by your Dropbox.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-balance text-sm sm:text-base text-slate-300">
              Hot DAM turns any Dropbox folder into a beautiful, searchable
              brand library — with boards, comments, share links, and blazing‑fast
              thumbnails your team will actually enjoy using.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/api/auth/dropbox"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0061ff] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/40 transition hover:bg-[#0052d9] focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                <span className="inline-block h-4 w-4">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z" />
                  </svg>
                </span>
                Connect with Dropbox
              </a>
              <p className="text-xs sm:text-sm text-slate-300">
                No migration · No new storage · Your files never leave Dropbox
              </p>
            </div>
            <dl className="mt-8 flex flex-wrap gap-6 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-full bg-slate-900/70 text-center text-base leading-7">
                  ⚡
                </span>
                <div>
                  <dt className="font-medium text-slate-100">Built for speed</dt>
                  <dd>Manifest caching, lazy thumbnails, and pagination by default.</dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-full bg-slate-900/70 text-center text-base leading-7">
                  ✅
                </span>
                <div>
                  <dt className="font-medium text-slate-100">Brand‑safe by design</dt>
                  <dd>Public links with download toggles and clean share pages.</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-brand-500/30 via-fuchsia-500/20 to-emerald-400/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between rounded-2xl bg-slate-900/90 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium text-slate-200">
                    Boards · Basbas campaign
                  </span>
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                  Hot DAM
                </span>
              </div>
              <div className="mt-3 grid gap-3 rounded-2xl bg-slate-900/60 p-3 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
                </div>
                <div className="space-y-3">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-300">
                <span>Visual boards · Masonry grid · Live from Dropbox</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-emerald-300">
                  10s setup
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-20 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                Everything you expect from a DAM.
              </h2>
              <p className="mt-2 max-w-xl text-sm sm:text-base text-slate-300">
                Hot DAM keeps the full feature set focused and opinionated, so small
                teams get all the power without the bloat.
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              All features included · No feature gating · Dropbox only
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-slate-50">Visual boards</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                Create boards for campaigns, clients, or channels. Covers are pulled
                from the first photo in each Dropbox folder so everything feels alive.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>· All Assets & Uncategorized views</li>
                <li>· Masonry grid that respects real image ratios</li>
                <li>· Drag‑free board reordering from the dashboard</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-slate-50">
                Search, tags & comments
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                Find assets by name or tag, and capture feedback where it belongs — on
                the file itself.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>· Per‑asset tags stored alongside files in Dropbox</li>
                <li>· Comment threads with author and timestamp</li>
                <li>· Board‑aware views for focused reviews</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-slate-50">
                Public share links
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                Share a board or a single asset with a clean, brand‑first public page —
                no Dropbox chrome.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>· Toggle downloads on/off per share link</li>
                <li>· Read‑only gallery views for clients and partners</li>
                <li>· Links stay powered by your Dropbox tokens</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-slate-50">
                Dropbox‑native storage
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                Hot DAM doesn&apos;t copy or own your files. It simply organizes what&apos;s
                already in Dropbox.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>· Assets, boards, and metadata live in a single folder</li>
                <li>· No sync clients, no exports, no vendor lock‑in</li>
                <li>· Works with your existing Dropbox sharing model</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-slate-50">Fast by default</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                Modern performance under the hood so even bloated brand folders feel
                snappy.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>· Manifest‑based asset indexing to avoid N+1 calls</li>
                <li>· Server‑side caching of lists and thumbnails</li>
                <li>· Lazy‑loaded images, skeletons, and pagination</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-slate-50">
                Simple, opinionated UX
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                No configuration rabbit holes. Just the essentials your studio or
                in‑house team needs.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>· Grid & list views for both boards and assets</li>
                <li>· Clean, clipboard‑friendly share and download actions</li>
                <li>· 30‑day sessions so you&apos;re not constantly logging in</li>
              </ul>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mt-20 grid gap-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              From blank to brand library in three steps.
            </h2>
            <p className="mt-2 max-w-xl text-sm sm:text-base text-slate-300">
              Hot DAM wraps a modern interface around the Dropbox you already use —
              no migration project required.
            </p>
            <ol className="mt-6 space-y-4 text-sm text-slate-200">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold">
                  1
                </span>
                <div>
                  <p className="font-medium">Connect Dropbox.</p>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Sign in with Dropbox and choose a base folder — Hot DAM sets up its
                    own subfolder for metadata and configuration.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold">
                  2
                </span>
                <div>
                  <p className="font-medium">Sync your assets.</p>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Run a sync to index existing files. Hot DAM writes lightweight
                    sidecar metadata files beside your assets.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold">
                  3
                </span>
                <div>
                  <p className="font-medium">Share and collaborate.</p>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Create boards, invite stakeholders with share links, and keep
                    everything discoverable with search, tags, and comments.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="space-y-4 rounded-2xl bg-slate-950/40 p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Built for modern brand teams
            </p>
            <div className="space-y-3 text-sm text-slate-200">
              <p>
                • Small brands who have &ldquo;a Dropbox full of logos&rdquo; and need a
                real home.
              </p>
              <p>• Studios managing client brand kits without spinning up new tools.</p>
              <p>• In‑house teams who want a DAM without convincing IT to move storage.</p>
            </div>
            <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 text-xs sm:text-sm text-emerald-100">
              Hot DAM focuses on the tier‑one workflows: browsing, organizing,
              commenting, and sharing. Advanced approvals and AI are on the roadmap —
              but you get a fast, opinionated core today.
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="mt-20 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 px-6 py-10 text-center sm:px-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Pricing that&apos;s as lightweight as the app.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-slate-300">
            Start free while Hot DAM is in active development. Your files stay in your
            own Dropbox, so you can walk away whenever you like.
          </p>
          <p className="mt-4 text-sm font-medium text-emerald-200">
            Early access · No credit card required
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-brand-500 to-amber-400 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-brand-400 hover:to-amber-300"
          >
            Get early access
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-400">
        Hot DAM — the D.A.M. your Dropbox craves. Your data stays in your Dropbox.
      </footer>
    </div>
  );
}
