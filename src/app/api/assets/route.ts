import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  createDropboxClient,
  listAssetsRecursive,
  metaPathForFile,
  getMetadata,
} from "@/lib/dropbox";
import { getManifestCached } from "@/lib/manifest";
import { getCachedAssets, setCachedAssets } from "@/lib/cache";

const DEFAULT_LIMIT = 48;
const MAX_LIMIT = 200;

function filterAndSort(
  assets: { path: string; meta: { title: string; tags: string[]; boards: string[]; updatedAt: string } }[],
  boardId: string | null,
  uncategorized: boolean,
  search: string,
  tag: string
) {
  let out = assets;
  if (uncategorized) {
    out = out.filter((a) => a.meta.boards.length === 0);
  } else if (boardId) {
    out = out.filter((a) => a.meta.boards.includes(boardId));
  }
  if (search) {
    const q = search.toLowerCase();
    out = out.filter(
      (a) =>
        a.meta.title.toLowerCase().includes(q) ||
        a.meta.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.path.toLowerCase().includes(q)
    );
  }
  if (tag) {
    const t = tag.toLowerCase();
    out = out.filter((a) => a.meta.tags.some((x) => x.toLowerCase() === t));
  }
  out = [...out].sort((a, b) => new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime());
  return out;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const boardId = searchParams.get("boardId");
  const uncategorized = searchParams.get("uncategorized") === "true";
  const search = searchParams.get("search") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const limit = Math.min(MAX_LIMIT, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT);
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));

  const cacheKey = `${session.baseFolder}|${boardId ?? ""}|${uncategorized}|${search}|${tag}|${limit}|${offset}`;
  const cached = getCachedAssets(cacheKey);
  if (cached) {
    return NextResponse.json({ assets: cached.assets, total: cached.total });
  }

  const manifest = await getManifestCached(session.baseFolder);

  if (manifest) {
    const filtered = filterAndSort(manifest.assets, boardId, uncategorized, search, tag);
    const total = filtered.length;
    const assets = filtered.slice(offset, offset + limit).map((a) => ({ meta: a.meta, path: a.path }));
    setCachedAssets(cacheKey, { assets, total });
    return NextResponse.json({ assets, total });
  }

  const dbx = createDropboxClient(session.dropboxAccessToken);
  const files = await listAssetsRecursive(dbx, session.baseFolder);
  const metaResults = await Promise.all(
    files.map(async (file) => {
      const meta = await getMetadata(dbx, metaPathForFile(file.path));
      const effectiveMeta = meta ?? {
        id: file.id,
        path: file.path,
        title: file.name.replace(/\.[^/.]+$/, ""),
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadedBy: "owner",
        boards: [],
        comments: [],
      };
      return { file, effectiveMeta };
    })
  );

  const all: { meta: (typeof metaResults)[number]["effectiveMeta"]; path: string }[] = [];
  for (const { file, effectiveMeta } of metaResults) {
    if (uncategorized && effectiveMeta.boards.length > 0) continue;
    if (boardId && !effectiveMeta.boards.includes(boardId)) continue;
    if (search) {
      const q = search.toLowerCase();
      if (
        !effectiveMeta.title.toLowerCase().includes(q) &&
        !effectiveMeta.tags.some((t) => t.toLowerCase().includes(q)) &&
        !file.name.toLowerCase().includes(q)
      )
        continue;
    }
    if (tag && !effectiveMeta.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) continue;
    all.push({ meta: effectiveMeta, path: file.path });
  }
  all.sort((a, b) => new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime());
  const total = all.length;
  const assets = all.slice(offset, offset + limit);
  setCachedAssets(cacheKey, { assets, total });
  return NextResponse.json({ assets, total });
}
