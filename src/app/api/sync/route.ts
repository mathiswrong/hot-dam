import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  createDropboxClient,
  listAssetsRecursive,
  listBoards,
  metaPathForFile,
  getMetadata,
  writeMetadata,
} from "@/lib/dropbox";
import { setManifest } from "@/lib/manifest";
import { invalidateAssetsCache } from "@/lib/cache";
import { v4 as uuidv4 } from "uuid";
import type { AssetMetadata } from "@/lib/types";

export async function POST(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.dropboxAccessToken || !session.baseFolder) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbx = createDropboxClient(session.dropboxAccessToken);
    const basePath = session.baseFolder;

    const boards = await listBoards(dbx, basePath);
    const boardFolderPaths = new Map<string, string>();
    for (const b of boards) {
      if (b.folderPath) {
        boardFolderPaths.set(b.folderPath.toLowerCase(), b.id);
      }
    }

    const files = await listAssetsRecursive(dbx, basePath);
    const metaResults = await Promise.all(
      files.map((file) => getMetadata(dbx, metaPathForFile(file.path)))
    );

    let created = 0;
    const now = new Date().toISOString();
    const effectiveMetas: AssetMetadata[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let meta = metaResults[i];

      if (!meta) {
        const pathLower = file.path.toLowerCase();
        const boardsList: string[] = [];
        boardFolderPaths.forEach((boardId, folderPath) => {
          if (
            pathLower.startsWith(folderPath) ||
            pathLower.includes(folderPath + "/")
          ) {
            boardsList.push(boardId);
          }
        });
        const dir = file.path.split("/").slice(0, -1).join("/");
        const assetsDir = `${basePath}/assets`;
        if (dir !== assetsDir && dir.startsWith(assetsDir + "/")) {
          const subPath = dir.slice(assetsDir.length + 1);
          const relFolder = `${assetsDir}/${subPath}`.toLowerCase();
          boardFolderPaths.forEach((bid, fp) => {
            if (relFolder.startsWith(fp) || fp.startsWith(relFolder)) {
              if (!boardsList.includes(bid)) boardsList.push(bid);
            }
          });
        }
        meta = {
          id: file.id,
          path: file.path,
          title: file.name.replace(/\.[^/.]+$/, ""),
          tags: [],
          createdAt: now,
          updatedAt: now,
          uploadedBy: "owner",
          boards: Array.from(new Set(boardsList)),
          comments: [],
        };
        await writeMetadata(dbx, metaPathForFile(file.path), meta);
        created++;
      }

      effectiveMetas.push(meta);
    }

    const assets = files.map((file, i) => ({
      path: file.path,
      meta: effectiveMetas[i]!,
    }));
    assets.sort((a, b) => {
      const da = new Date(a.meta.updatedAt).getTime();
      const db = new Date(b.meta.updatedAt).getTime();
      return db - da;
    });

    await setManifest({
      baseFolder: basePath,
      updatedAt: now,
      assets,
    });
    invalidateAssetsCache();

    return NextResponse.json({ created });
  } catch (e: unknown) {
    console.error("SYNC ERROR", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}