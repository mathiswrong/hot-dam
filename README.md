# Hot DAM

**the D.A.M. your Dropbox craves**

Digital asset management for small brands. Your Dropbox, supercharged.

## Features

- **Dropbox-backed storage** — All assets live in your Dropbox. No separate backend.
- **Boards (albums)** — Organize assets into boards. Create boards with optional folder paths so files dropped into those folders auto-join the board.
- **Uncategorized** — Assets not in any board appear in the built-in Uncategorized album.
- **Manual drops** — Drop files directly into your Dropbox folder, then click "Refresh from Dropbox" to import them.
- **Tags & search** — Tag assets and search by filename or tag.
- **Comments** — Add comments to any asset.
- **Public share links** — Share boards or individual assets with a public URL. Toggle **Allow downloads** per link.

## Setup

1. **Create a Dropbox app** at [dropbox.com/developers/apps](https://www.dropbox.com/developers/apps)
   - Choose "Scoped access"
   - Add permissions: `files.metadata.read`, `files.metadata.write`, `files.content.read`, `files.content.write`, `account_info`
   - Add redirect URI: `http://localhost:3000/api/auth/dropbox/callback` (and your production URL when deploying)

2. **Copy env file and configure**
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   - `DROPBOX_APP_KEY` — Your app key
   - `DROPBOX_APP_SECRET` — Your app secret
   - `DROPBOX_REDIRECT_URI` — `http://localhost:3000/api/auth/dropbox/callback`
   - `SESSION_SECRET` — Generate with `openssl rand -hex 32`
   - `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for local dev

3. **Install and run**
   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000), click "Get started", and connect your Dropbox.

## How it works

- On first login, Hot DAM creates a `/Hot DAM` folder in your Dropbox with `assets/`, `boards/`, and `links/` subfolders.
- Upload via the app or drop files into `Hot DAM/assets/` (or any subfolder). Run "Refresh from Dropbox" to import new files.
- Create boards with optional folder paths (e.g. `/Hot DAM/assets/spring-2026`). Files in that folder auto-join the board on sync.
- Metadata (tags, comments) is stored as `.meta.json` sidecar files next to each asset.

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Dropbox SDK
