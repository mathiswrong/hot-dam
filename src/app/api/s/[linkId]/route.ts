import { NextRequest, NextResponse } from "next/server";
import { getStoredSession, getAccountForLink } from "@/lib/store";
import {
  createDropboxClient,
  getLinkById,
  getBoard,
  listAssetsRecursive,
  metaPathForFile,
  getMetadata,
} from "@/lib/dropbox";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params;
  const accountId = await getAccountForLink(linkId);
  if (!accountId) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const session = await getStoredSession(accountId);
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Link expired or invalid" }, { status: 404 });
  }

  const dbx = createDropboxClient(session.dropboxAccessToken);
  const link = await getLinkById(dbx, session.baseFolder, linkId);
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  if (link.type === "board") {
    const board = await getBoard(
      dbx,
      `${session.baseFolder}/boards/${link.targetId}.board.json`
    );
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const files = await listAssetsRecursive(dbx, session.baseFolder);
    const assets: { meta: Awaited<ReturnType<typeof getMetadata>>; path: string }[] = [];
    for (const file of files) {
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
      const inBoard =
        effectiveMeta.boards.includes(link.targetId) ||
        (board.folderPath &&
          file.path.toLowerCase().startsWith(board.folderPath.toLowerCase()));
      if (inBoard) {
        assets.push({ meta: effectiveMeta, path: file.path });
      }
    }
    assets.sort((a, b) => {
      const da = new Date(a.meta!.updatedAt).getTime();
      const db = new Date(b.meta!.updatedAt).getTime();
      return db - da;
    });

    return NextResponse.json({
      link,
      board,
      assets,
    });
  }

  if (link.type === "asset") {
    const files = await listAssetsRecursive(dbx, session.baseFolder);
    for (const file of files) {
      const meta = await getMetadata(dbx, metaPathForFile(file.path));
      if (meta?.id === link.targetId) {
        return NextResponse.json({
          link,
          asset: { meta, path: file.path },
        });
      }
    }
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  return NextResponse.json({ error: "Invalid link type" }, { status: 400 });
}
