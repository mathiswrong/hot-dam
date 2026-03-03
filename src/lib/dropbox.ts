import { Dropbox } from "dropbox";
import type { AssetMetadata, Board, ShareLink, WorkspaceSettings } from "./types";

const META_SUFFIX = ".meta.json";
const BOARD_SUFFIX = ".board.json";
const LINK_SUFFIX = ".link.json";

/**
 * In Node, native fetch Response has arrayBuffer() but not buffer().
 * The Dropbox SDK calls response.buffer() in Node, so we must polyfill it.
 */
async function dropboxFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, init);
  if (typeof (res as any).buffer !== "function") {
    (res as any).buffer = function (this: Response) {
      return this.arrayBuffer().then((ab) => Buffer.from(ab));
    };
  }
  return res;
}

export function createDropboxClient(accessToken: string) {
  return new Dropbox({ accessToken, fetch: dropboxFetch });
}

export function metaPathForFile(filePath: string): string {
  return `${filePath}${META_SUFFIX}`;
}

export function isMetaFile(path: string): boolean {
  return path.endsWith(META_SUFFIX);
}

export function assetPathFromMeta(metaPath: string): string {
  return metaPath.slice(0, -META_SUFFIX.length);
}

export async function ensureBaseStructure(
  dbx: Dropbox,
  basePath: string
): Promise<void> {
  const folders = ["assets", "boards", "links"];
  for (const folder of folders) {
    const path = `${basePath}/${folder}`;
    try {
      await dbx.filesCreateFolderV2({ path, autorename: false });
    } catch (e: unknown) {
      const err = e as { error?: { error?: { path?: { ".tag"?: string } } } };
      if (err?.error?.error?.path?.[".tag"] !== "conflict") throw e;
    }
  }

  const settingsPath = `${basePath}/settings.json`;
  try {
    await dbx.filesGetMetadata({ path: settingsPath });
  } catch {
    const defaultSettings: WorkspaceSettings = {
      name: "Hot DAM",
      baseFolder: basePath,
    };
    await dbx.filesUpload({
      path: settingsPath,
      contents: JSON.stringify(defaultSettings, null, 2),
      mode: { ".tag": "add" },
    });
  }
}

export async function listAssetsRecursive(
  dbx: Dropbox,
  basePath: string
): Promise<{ path: string; id: string; name: string; ".tag": string }[]> {
  const results: { path: string; id: string; name: string; ".tag": string }[] = [];
  const assetsPath = `${basePath}/assets`;

  async function processEntries(
    entries: { path_display?: string; path_lower?: string; id?: string; name?: string; ".tag"?: string }[]
  ) {
    for (const entry of entries) {
      if (!entry[".tag"]) continue;
      if (entry[".tag"] === "folder" && entry.path_lower) {
        await walk(entry.path_lower);
      } else if (entry[".tag"] === "file" && !entry.name?.endsWith(META_SUFFIX)) {
        results.push({
          path: entry.path_display ?? entry.path_lower ?? "",
          id: entry.id ?? "",
          name: entry.name ?? "",
          ".tag": entry[".tag"],
        });
      }
    }
  }

  async function walk(path: string) {
    let cursor: string | undefined;
    let res = await dbx.filesListFolder({ path });
    await processEntries(res.result.entries);
    while (res.result.has_more && res.result.cursor) {
      res = await dbx.filesListFolderContinue({ cursor: res.result.cursor });
      await processEntries(res.result.entries);
    }
  }

  try {
    await walk(assetsPath);
  } catch (e: unknown) {
    const err = e as { error?: { error?: { path?: { ".tag"?: string } } } };
    if (err?.error?.error?.path?.[".tag"] === "not_found") return [];
    throw e;
  }
  return results;
}

export async function getMetadata(
  dbx: Dropbox,
  metaPath: string
): Promise<AssetMetadata | null> {
  try {
    const res = await dbx.filesDownload({ path: metaPath });
    const anyResult = res.result as any;
    const blobOrBinary = anyResult.fileBlob ?? anyResult.fileBinary;
    if (!blobOrBinary) return null;

    let text: string;
    if (blobOrBinary && typeof blobOrBinary.arrayBuffer === "function") {
      const buf = Buffer.from(await blobOrBinary.arrayBuffer());
      text = buf.toString("utf8");
    } else {
      const buf = Buffer.isBuffer(blobOrBinary)
        ? blobOrBinary
        : Buffer.from(blobOrBinary as string);
      text = buf.toString("utf8");
    }
    return JSON.parse(text) as AssetMetadata;
  } catch {
    return null;
  }
}

export async function writeMetadata(
  dbx: Dropbox,
  metaPath: string,
  meta: AssetMetadata
): Promise<void> {
  await dbx.filesUpload({
    path: metaPath,
    contents: JSON.stringify(meta, null, 2),
    mode: { ".tag": "overwrite" },
  });
}

/** Returns the path of the first file in the folder (excluding .meta.json), for use as cover. */
export async function getFirstFilePathInFolder(
  dbx: Dropbox,
  folderPath: string
): Promise<string | null> {
  try {
    const res = await dbx.filesListFolder({ path: folderPath });
    for (const entry of res.result.entries) {
      if (entry[".tag"] === "file" && entry.name && !entry.name.endsWith(META_SUFFIX)) {
        return (entry as { path_display?: string }).path_display ?? (entry as { path_lower?: string }).path_lower ?? null;
      }
    }
  } catch {
    // folder may not exist
  }
  return null;
}

export async function listBoards(
  dbx: Dropbox,
  basePath: string
): Promise<Board[]> {
  const boardsPath = `${basePath}/boards`;
  const boards: Board[] = [];
  try {
    const res = await dbx.filesListFolder({ path: boardsPath });
    for (const entry of res.result.entries) {
      if (entry[".tag"] === "file" && entry.name.endsWith(BOARD_SUFFIX)) {
        const meta = await getBoard(dbx, `${boardsPath}/${entry.name}`);
        if (meta) boards.push(meta);
      }
    }
  } catch (e: unknown) {
    const err = e as { error?: { error?: { path?: { ".tag"?: string } } } };
    if (err?.error?.error?.path?.[".tag"] !== "not_found") throw e;
  }
  boards.sort((a, b) => {
    const oa = a.order ?? 999;
    const ob = b.order ?? 999;
    if (oa !== ob) return oa - ob;
    return (a.name || "").localeCompare(b.name || "");
  });
  return boards;
}

export async function getBoardById(
  dbx: Dropbox,
  basePath: string,
  boardId: string
): Promise<Board | null> {
  const boardsPath = `${basePath}/boards`;
  try {
    const res = await dbx.filesListFolder({ path: boardsPath });
    const name = `${boardId}${BOARD_SUFFIX}`;
    for (const entry of res.result.entries) {
      if (entry[".tag"] === "file" && (entry as { name?: string }).name === name) {
        return getBoard(dbx, `${boardsPath}/${name}`);
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function deleteBoard(
  dbx: Dropbox,
  basePath: string,
  boardId: string
): Promise<void> {
  const path = `${basePath}/boards/${boardId}${BOARD_SUFFIX}`;
  await dbx.filesDeleteV2({ path });
}

export async function getBoard(
  dbx: Dropbox,
  path: string
): Promise<Board | null> {
  try {
    const res = await dbx.filesDownload({ path });
    const anyResult = res.result as any;
    const blobOrBinary = anyResult.fileBlob ?? anyResult.fileBinary;
    if (!blobOrBinary) return null;

    let text: string;
    if (blobOrBinary && typeof blobOrBinary.arrayBuffer === "function") {
      const buf = Buffer.from(await blobOrBinary.arrayBuffer());
      text = buf.toString("utf8");
    } else {
      const buf = Buffer.isBuffer(blobOrBinary)
        ? blobOrBinary
        : Buffer.from(blobOrBinary as string);
      text = buf.toString("utf8");
    }
    return JSON.parse(text) as Board;
  } catch {
    return null;
  }
}

export async function writeBoard(
  dbx: Dropbox,
  basePath: string,
  board: Board
): Promise<void> {
  const path = `${basePath}/boards/${board.id}${BOARD_SUFFIX}`;
  await dbx.filesUpload({
    path,
    contents: JSON.stringify(board, null, 2),
    mode: { ".tag": "overwrite" },
  });
}

export async function listLinks(
  dbx: Dropbox,
  basePath: string
): Promise<ShareLink[]> {
  const linksPath = `${basePath}/links`;
  const links: ShareLink[] = [];
  try {
    const res = await dbx.filesListFolder({ path: linksPath });
    for (const entry of res.result.entries) {
      if (entry[".tag"] === "file" && entry.name.endsWith(LINK_SUFFIX)) {
        const link = await getLink(dbx, `${linksPath}/${entry.name}`);
        if (link) links.push(link);
      }
    }
  } catch (e: unknown) {
    const err = e as { error?: { error?: { path?: { ".tag"?: string } } } };
    if (err?.error?.error?.path?.[".tag"] !== "not_found") throw e;
  }
  return links;
}

export async function getLinkById(
  dbx: Dropbox,
  basePath: string,
  linkId: string
): Promise<ShareLink | null> {
  const linksPath = `${basePath}/links`;
  try {
    const res = await dbx.filesListFolder({ path: linksPath });
    for (const entry of res.result.entries) {
      if (entry[".tag"] === "file" && entry.name.includes(linkId)) {
        const link = await getLink(dbx, `${linksPath}/${entry.name}`);
        if (link?.id === linkId) return link;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

async function getLink(dbx: Dropbox, path: string): Promise<ShareLink | null> {
  try {
    const res = await dbx.filesDownload({ path });
    const anyResult = res.result as any;
    const blobOrBinary = anyResult.fileBlob ?? anyResult.fileBinary;
    if (!blobOrBinary) return null;

    let text: string;
    if (blobOrBinary && typeof blobOrBinary.arrayBuffer === "function") {
      const buf = Buffer.from(await blobOrBinary.arrayBuffer());
      text = buf.toString("utf8");
    } else {
      const buf = Buffer.isBuffer(blobOrBinary)
        ? blobOrBinary
        : Buffer.from(blobOrBinary as string);
      text = buf.toString("utf8");
    }
    return JSON.parse(text) as ShareLink;
  } catch {
    return null;
  }
}

export async function writeLink(
  dbx: Dropbox,
  basePath: string,
  link: ShareLink
): Promise<void> {
  const path = `${basePath}/links/${link.type}.${link.targetId}.${link.id}${LINK_SUFFIX}`;
  await dbx.filesUpload({
    path,
    contents: JSON.stringify(link, null, 2),
    mode: { ".tag": "overwrite" },
  });
}

export function generateLinkId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
